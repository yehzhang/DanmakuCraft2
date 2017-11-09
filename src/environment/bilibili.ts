import * as $ from 'jquery';
import {
  CommentProvider,
  EnvironmentAdapter,
  GameContainerProvider,
  NewCommentEvent,
  WorldProxy
} from './components';
import {EventDispatcher} from '../util';
import {bindFirst, CommentDataUtil, webSocketManager} from './util';
import {CommentData} from '../comment';
import {TextDecoder, TextEncoder} from 'text-encoding-shim';
import Timer = NodeJS.Timer;

export default class BilibiliAdapter implements EnvironmentAdapter {
  worldProxy: WorldProxy;

  constructor() {
    this.worldProxy = null;
  }

  getCommentProvider(): CommentProvider {
    if (this.worldProxy == null) {
      throw new Error('WorldProxy is not set');
    }
    return new BilibiliCommentProvider(this.worldProxy);
  }

  setWorldProxy(worldProxy: WorldProxy) {
    this.worldProxy = worldProxy;
  }

  getGameContainerProvider(): GameContainerProvider {
    return new BilibiliContainerProvider();
  }
}

class BilibiliContainerProvider implements GameContainerProvider {
  getContainer() {
    if (!BilibiliContainerProvider.canRunOnThisWebPage()) {
      throw new Error('Script cannot be run on this page');
    }

    // TODO check if wrap content is recovered on fullscreen / widescreen change.
    let $videoFrame = $('.bilibili-player-video-wrap');
    $videoFrame.empty();

    return $videoFrame[0];
  }

  private static canRunOnThisWebPage() {
    if (Parameters.aid !== Constants.aid) {
      return false;
    }
    return true;
  }
}

class BilibiliCommentProvider extends CommentProvider {
  receiver: RemoteCommentReceiver;
  injector: LocalCommentInjector;

  constructor(worldProxy: WorldProxy) {
    super();

    this.injector = new LocalCommentInjector(worldProxy);

    this.receiver = new RemoteCommentReceiver(Parameters.chatBroadcastUrl);
    this.receiver.addEventListener(CommentProvider.NEW_COMMENT, this.onNewComment.bind(this));
  }

  private onNewComment(event: NewCommentEvent) {
    this.dispatchEvent(event);
  }

  async getAllComments(): Promise<CommentData[]> {
    return new Promise<Document>((resolve, reject) => {
      $.ajax({
        type: 'GET',
        url: Parameters.commentXmlUrl,
        dataType: 'xml',
        success: resolve,
        error: reject,
      });
    })
        .then(data => {
          return (data.getElementsByTagName('d') as any as Node[])
              .map(commentElement => {
                let attributes = commentElement.attributes.getNamedItem('p').value;
                let text = commentElement.textContent;
                return CommentDataUtil.parseFromXmlStrings(attributes, text);
              });
        }, xhr => {
          let msg = `Cannot get comments from ${Parameters.commentXmlUrl}: ${xhr.statusText}`;
          throw new Error(msg);
        });
  }
}

class LocalCommentInjector {
  private $textInput: JQuery<HTMLElement>;
  private $sendButton: JQuery<HTMLElement>;

  constructor(private worldProxy: WorldProxy) {
    this.$textInput = $('.bilibili-player-video-danmaku-input');

    this.$sendButton = $('.bilibili-player-video-btn-send');
    bindFirst(this.$sendButton, 'click', this.onClickSendButtonInitial.bind(this));
  }

  /**
   * Appends metadata to a comment to be sent. Does not provide comments, because every comment
   * sent is expected to be received by RemoteCommentReceiver.
   */
  private onClickSendButtonInitial(event: Event) {
    if (this.isSendButtonDisabled()) {
      return;
    }

    let commentText = this.$textInput.val().toString();
    let injectedCommentText = this.buildInjectedCommentText(commentText);

    let $fontSelection = $('.bilibili-player-mode-selection-row.fontsize .selection-span.active');
    let commentSize = parseInt($fontSelection.attr('data-value'), 10);

    if (!this.worldProxy.requestForPlacingComment(commentText, commentSize)) {
      event.stopImmediatePropagation();
      return;
    }

    // Update comment text in UI and let player check if the text is valid.
    this.$textInput.val(injectedCommentText);
    this.$textInput.trigger('input');

    // If the text is invalid, the button would be disabled.
    if (this.isSendButtonDisabled()) {
      // Restore the comment text and let through the event, so that user would see the disabled
      // button, but not comment changes.
      this.$textInput.val(commentText);
    }
  }

  private buildInjectedCommentText(text: string): string {
    throw new Error('Not implemented'); // TODO
    // return text + CommentDataUtil.generateCommentMetadata(text, x, y);
  }

  private isSendButtonDisabled() {
    return this.$sendButton.hasClass('bpui-state-disabled');
  }
}

class RemoteCommentReceiver extends EventDispatcher<NewCommentEvent> {
  private socket: WebSocket;
  private doRetry: boolean;
  private heartBeat: Timer;

  private static frameDefinitionEntries = [
    {name: 'Header Length', key: 'headerLen', size: 2, offset: 4, value: 16},
    {name: 'Protocol Version', key: 'ver', size: 2, offset: 6, value: 1},
    {name: 'Operation', key: 'op', size: 4, offset: 8, value: 2},
    {name: 'Sequence Id', key: 'seq', size: 4, offset: 12, value: 1},
  ];

  constructor(private url: string) {
    super();

    this.doRetry = true;
    this.heartBeat = null;

    this.startWebSocket();
  }

  private startWebSocket() {
    this.socket = webSocketManager.build(this.url);
    this.socket.binaryType = 'arraybuffer';

    let that = this;
    this.socket.onopen = () => {
      that.sendInitialMessage();
    };

    this.socket.onmessage = this.onMessage.bind(this);

    this.socket.onclose = () => {
      clearTimeout(that.heartBeat);

      if (that.doRetry) {
        setTimeout(() => {
          that.startWebSocket();
        }, 5 * 1e3);
      }
    };
  }

  private sendInitialMessage() {
    let that = this;

    let data: any = {
      uid: Parameters.uid,
      roomid: Constants.roomId,
      protover: 1,
    };
    if (Parameters.aid) {
      data.aid = Parameters.aid;
    }
    data.from = 7;
    let message = this.encode(data, 7);

    setTimeout(() => {
      that.socket.send(message);
    }, 0);
  }

  private startHeartBeat() {
    let that = this;

    clearTimeout(this.heartBeat);

    let data = this.encode({}, 2);
    this.socket.send(data);

    this.heartBeat = setTimeout(() => {
      that.startHeartBeat();
    }, 30 * 1e3);
  }

  private onMessage(event: { data: ArrayBuffer }) {
    try {
      let data = this.parse(event.data);
      if (data instanceof Array) {
        data.forEach(b => {
          this.onMessage(b);
        });
      } else if (data instanceof Object) {
        switch (data.op) {
          case 5:
            this.onReceivedMessage(data.body);
            break;
          case 8:
            this.startHeartBeat();
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  private onReceivedMessage(body: any) {
    if (body instanceof Array) {
      body.map(b => {
        this.onReceivedMessage(b);
      });
    } else if (body instanceof Object) {
      this._onReceivedMessage(body);
    }
  }

  private _onReceivedMessage(body: any) {
    if (!body) {
      return;
    }
    let info = body.info;
    if (body.cmd === 'DM') {
      if (info instanceof Array) {
        let attributes = info[0];
        let text = info[1];
        let comment = CommentDataUtil.parseFromXmlStrings(attributes, text);

        this.dispatchEvent(new NewCommentEvent(comment));
      }
    }
  }

  // destroy() {
  //   clearTimeout(this.heartBeat);
  //
  //   this.doRetry = false;
  //
  //   if (this.socket) {
  //     this.socket.close();
  //     this.socket = null;
  //   }
  // }

  private encode(data: any, protocolVersion: number) {
    let textEncoder = new TextEncoder();
    let dataArray = textEncoder.encode(JSON.stringify(data));

    let metadataView = new DataView(new ArrayBuffer(16), 0);
    metadataView.setInt32(0, 16 + dataArray.byteLength);
    metadataView.setInt32(0, 16 + dataArray.byteLength);
    RemoteCommentReceiver.frameDefinitionEntries[2].value = protocolVersion;
    RemoteCommentReceiver.frameDefinitionEntries.forEach(entry => {
      if (entry.size === 4) {
        metadataView.setInt32(entry.offset, entry.value);
      } else if (entry.size === 2) {
        metadataView.setInt16(entry.offset, entry.value);
      }
    });

    return RemoteCommentReceiver.mergeBuffers(metadataView.buffer, dataArray.buffer);
  }

  private static mergeBuffers(b: ArrayBuffer, c: ArrayBuffer): ArrayBuffer {
    let arrayB = new Uint8Array(b);
    let arrayC = new Uint8Array(c);
    let d = new Uint8Array(arrayB.byteLength + arrayC.byteLength);
    d.set(arrayB, 0);
    d.set(arrayC, arrayB.byteLength);
    return d.buffer;
  }

  private parse(buffer: ArrayBuffer) {
    let bufferView = new DataView(buffer);

    let data: any = {
      packetLen: bufferView.getInt32(0),
    };
    RemoteCommentReceiver.frameDefinitionEntries.forEach(entry => {
      if (entry.size === 4) {
        data[entry.key] = bufferView.getInt32(entry.offset);
      } else if (entry.size === 2) {
        data[entry.key] = bufferView.getInt16(entry.offset);
      }
    });

    if (data.op && data.op === 5) {
      data.body = [];
      let decoder = new TextDecoder();
      let step = data.packetLen;
      for (let i = 0; i < buffer.byteLength; i += step) {
        step = bufferView.getInt32(i);
        let l = bufferView.getInt16(i + 4);
        try {
          // TODO test
          let slicedBuffer = buffer.slice(i + l, i + step);
          let slicedBufferView = new DataView(slicedBuffer);
          let value = JSON.parse(decoder.decode(slicedBufferView));
          data.body.push(value);
        } catch (ignored) {
        }
      }
    } else if (data.op && data.op === 3) {
      data.body = {
        count: bufferView.getInt32(16),
      };
    }

    return data;
  }
}

class Parameters {
  static readonly aid: number = parseInt((window as any).aid, 10);
  static readonly cid: number = parseInt((window as any).cid, 10);
  static readonly uid: string = (window as any).uid;
  static readonly isHttps: boolean = window.location.protocol === 'https://';

  static buildUrl(protocolName: string, url: string) {
    return `${protocolName}${this.isHttps ? 's' : ''}://${url}`;
  }

  static readonly commentXmlUrl: string = Parameters.buildUrl(
      'http', `comment.bilibili.com/${Parameters.cid}.xml`);
  static readonly chatBroadcastUrl: string = Parameters.buildUrl(
      'ws', 'broadcast.chat.bilibili.com:4095/sub');
}

class Constants {
  static readonly roomId: number = 4145439; // TODO update to real one
  static readonly aid: number = 2718860; // TODO update to real one
}
