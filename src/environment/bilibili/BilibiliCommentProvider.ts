import CommentProvider from '../interface/CommentProvider';
import {CommentData} from '../../entity/comment';
import {EventType} from '../../event/Event';
import EventDispatcher from '../../event/EventDispatcher';
import {EnvironmentVariables, Parameters} from './BilibiliAdapter';
import {TextDecoder, TextEncoder} from 'text-encoding-shim';
import CommentDataUtil from './CommentDataUtil';
import {webSocketManager} from '../util';

export default class BilibiliCommentProvider extends CommentProvider {
  private connected: boolean;
  private receiver: RemoteCommentReceiver;

  constructor() {
    super();

    this.connected = false;

    this.receiver = new RemoteCommentReceiver(EnvironmentVariables.chatBroadcastUrl);
    this.receiver.delegateEvent(CommentProvider.NEW_COMMENT, this);
  }

  connect() {
    if (this.connected) {
      return;
    }

    this.receiver.connect();

    this.connected = true;
  }

  async getAllComments(): Promise<CommentData[]> {
    return new Promise<Document>((resolve, reject) => {
      $.ajax({
        type: 'GET',
        url: EnvironmentVariables.commentXmlUrl,
        dataType: 'xml',
        success: resolve,
        error: reject,
      });
    })
        .then(data => {
          return (data.getElementsByTagName('d') as any as Node[])
              .map(commentElement => {
                let attributes = commentElement.attributes.getNamedItem('p').value;
                let text = commentElement.textContent || '';
                return CommentDataUtil.parseFromXmlStrings(attributes, text);
              })
              .filter(Boolean) as CommentData[];
        }, xhr => {
          let msg = `Cannot get comments from ${EnvironmentVariables.commentXmlUrl}: ${xhr.statusText}`;
          throw new Error(msg);
        });
  }
}

class RemoteCommentReceiver extends EventDispatcher<EventType.COMMENT_NEW> {
  private static frameDefinitionEntries = [
    {name: 'Header Length', key: 'headerLen', size: 2, offset: 4, value: 16},
    {name: 'Protocol Version', key: 'ver', size: 2, offset: 6, value: 1},
    {name: 'Operation', key: 'op', size: 4, offset: 8, value: 2},
    {name: 'Sequence Id', key: 'seq', size: 4, offset: 12, value: 1},
  ];
  private connected: boolean;
  private socket: WebSocket;
  private doRetry: boolean;
  private heartBeat: number | null;

  constructor(private url: string) {
    super();

    this.doRetry = true;
    this.heartBeat = null;
  }

  private static mergeBuffers(b: ArrayBuffer, c: ArrayBuffer): ArrayBuffer {
    let arrayB = new Uint8Array(b);
    let arrayC = new Uint8Array(c);
    let d = new Uint8Array(arrayB.byteLength + arrayC.byteLength);
    d.set(arrayB, 0);
    d.set(arrayC, arrayB.byteLength);
    return d.buffer;
  }

  connect() {
    if (this.connected) {
      return;
    }

    this.startWebSocket();

    this.connected = true;
  }

  private startWebSocket() {
    this.socket = webSocketManager.build(this.url);
    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = () => {
      this.sendInitialMessage();
    };

    this.socket.onmessage = this.onMessage.bind(this);

    this.socket.onclose = event => {
      console.debug('RemoteCommentReceiver onClose', event);

      if (this.heartBeat != null) {
        clearTimeout(this.heartBeat);
      }

      if (this.doRetry) {
        setTimeout(() => {
          this.startWebSocket();
        }, 5 * 1e3);
      }
    };
  }

  private sendInitialMessage() {
    let that = this;

    let data: any = {
      uid: EnvironmentVariables.uid,
      roomid: Parameters.ROOM_ID,
      protover: 1,
    };
    if (EnvironmentVariables.aid) {
      data.aid = EnvironmentVariables.aid;
    }
    data.from = 7;
    let message = this.encode(data, 7);

    setTimeout(() => {
      that.socket.send(message);
    }, 0);
  }

  private startHeartBeat() {
    let that = this;

    if (this.heartBeat != null) {
      clearTimeout(this.heartBeat);
    }

    let data = this.encode({}, 2);
    this.socket.send(data);

    this.heartBeat = window.setTimeout(() => {
      that.startHeartBeat();
    }, 30 * 1e3);
  }

  private onMessage(event: { data: ArrayBuffer }) {
    console.debug('RemoteCommentReceiver onMessage', event);

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
      console.error(error);
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

        if (comment != null) {
          this.dispatchEvent(CommentProvider.NEW_COMMENT, comment);
        }
      }
    }
  }

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
