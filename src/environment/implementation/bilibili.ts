import * as $ from 'jquery';
import EnvironmentAdapter from '../EnvironmentAdapter';
import {EventDispatcher} from '../../dispatcher';
import {bindFirst, isLinux, webSocketManager} from '../util';
import {CommentData} from '../../entity/comment';
import {TextDecoder, TextEncoder} from 'text-encoding-shim';
import UniverseProxy from '../UniverseProxy';
import {EffectData, LocallyOriginatedCommentEffectManager} from '../../effect';
import CommentProvider, {NewCommentEvent} from '../CommentProvider';
import GameContainerProvider from '../GameContainerProvider';
import SettingsManager, {SettingsOption} from '../SettingsManager';

export default class BilibiliAdapter implements EnvironmentAdapter {
  private universeProxy: UniverseProxy | null;

  constructor() {
    this.universeProxy = null;
  }

  getCommentProvider(): CommentProvider {
    if (this.universeProxy == null) {
      throw new Error('UniverseProxy is not set');
    }
    return new BilibiliCommentProvider(this.universeProxy);
  }

  setProxy(universeProxy: UniverseProxy) {
    this.universeProxy = universeProxy;
  }

  getGameContainerProvider(): GameContainerProvider {
    return new BilibiliContainerProvider();
  }

  getSettingsManager(): SettingsManager {
    return new LocalStorageSettingsManager();
  }
}

class BilibiliContainerProvider implements GameContainerProvider {
  private static readonly CONTAINER_ID = 'danmaku-craft-container';

  getContainerId(): string {
    if (!BilibiliContainerProvider.canRunOnThisWebPage()) {
      throw new Error('Script cannot be run on this page');
    }

    let $videoFrame = $('.bilibili-player-video-wrap');
    $videoFrame.empty();
    // $videoFrame is not recovered when player's size is changed.

    $videoFrame.attr('id', BilibiliContainerProvider.CONTAINER_ID);

    return BilibiliContainerProvider.CONTAINER_ID;
  }

  private static canRunOnThisWebPage() {
    if (EnvironmentVariables.aid !== Parameters.AID) {
      return false;
    }
    return true;
  }
}

class BilibiliCommentProvider extends CommentProvider {
  receiver: RemoteCommentReceiver;
  injector: LocalCommentInjector;

  constructor(universeProxy: UniverseProxy) {
    super();

    this.injector = new LocalCommentInjector(universeProxy);

    this.receiver = new RemoteCommentReceiver(EnvironmentVariables.chatBroadcastUrl);
    this.receiver.addEventListener(CommentProvider.NEW_COMMENT, this.onNewComment.bind(this));
  }

  connect() {
    if (this.connected) {
      return;
    }

    this.receiver.connect();

    this.connected = true;
  }

  private onNewComment(event: NewCommentEvent) {
    this.dispatchEvent(event);
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

class LocalCommentInjector {
  private $textInput: JQuery<HTMLElement>;
  private $sendButton: JQuery<HTMLElement>;
  private effectManager: LocallyOriginatedCommentEffectManager;

  constructor(private universeProxy: UniverseProxy) {
    this.$textInput = $('.bilibili-player-video-danmaku-input');

    this.$sendButton = $('.bilibili-player-video-btn-send');
    bindFirst(this.$sendButton, 'click', this.onClickSendButtonInitial.bind(this));

    this.effectManager = universeProxy.getEffectManager();
  }

  /**
   * Appends metadata to a comment to be sent. Does not provide comments, because every comment
   * sent is expected to be received by RemoteCommentReceiver.
   */
  private onClickSendButtonInitial(event: Event) {
    if (this.isSendButtonDisabled()) {
      return;
    }

    let commentValue = this.$textInput.val();
    if (!commentValue) {
      return;
    }

    let commentText = commentValue.toString();
    let injectedCommentText = this.buildInjectedCommentText(commentText);
    let commentSize = LocalCommentInjector.getSelectedFontSize();
    if (!this.universeProxy.requestForPlacingComment(injectedCommentText, commentSize)) {
      event.stopImmediatePropagation();
      return;
    }

    this.effectManager.activateOne();

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

  private static getSelectedFontSize() {
    let commentSize;

    let $fontSelection = $('.bilibili-player-mode-selection-row.fontsize .selection-span.active');
    let commentSizeValue = $fontSelection.attr('data-value');
    if (commentSizeValue) {
      commentSize = Number(commentSizeValue);
    } else {
      commentSize = Parameters.DEFAULT_FONT_SIZE;
    }

    return commentSize;
  }

  private buildInjectedCommentText(text: string): string {
    let effectData;
    if (this.effectManager.hasEffect()) {
      effectData = this.effectManager.peek();
    }

    let player = this.universeProxy.getPlayer();
    let playerCoordinate = player.getCoordinate();

    return CommentDataUtil.buildInjectedCommentText(text, playerCoordinate, effectData);
  }

  private isSendButtonDisabled() {
    return this.$sendButton.hasClass('bpui-state-disabled');
  }
}

class RemoteCommentReceiver extends EventDispatcher<NewCommentEvent> {
  private connected: boolean;
  private socket: WebSocket;
  private doRetry: boolean;
  private heartBeat: number | null;

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
          this.dispatchEvent(new NewCommentEvent(comment));
        }
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

class CommentDataUtil {
  static readonly METADATA_DELIMITER = '/[';

  static parseFromXmlStrings(attributes: string, text: string): CommentData | null {
    // Parse metadata
    let indexMetadata = text.lastIndexOf(this.METADATA_DELIMITER);
    if (indexMetadata === -1) {
      return null;
    }

    let metadataText = text.slice(indexMetadata + this.METADATA_DELIMITER.length);
    let properties = [];
    for (let i = 0; i < metadataText.length; i++) {
      properties.push(metadataText.charCodeAt(i));
    }

    try {
      properties = this.toActualCharCodes(properties);
    } catch (ignored) {
      return null;
    }

    // Parse comment text
    let commentText = text.slice(0, indexMetadata);

    // Validate by MAC
    let tag = properties.pop();
    let tag2 = this.mac(commentText, properties);
    if (tag !== tag2) {
      return null;
    }

    // Parse properties
    let positionX;
    let positionY;
    let effectData;
    if (properties.length === 2) {
      [positionX, positionY] = properties;
      effectData = null;
    } else if (properties.length === 4) {
      let effectType;
      let effectParameter;
      [positionX, positionY, effectType, effectParameter] = properties;
      effectData = new EffectData(effectType, effectParameter);
    } else {
      return null;
    }

    // Parse attributes
    let [, , size, color, sendTime, , userId, ] = attributes.split(',');

    return new CommentData(
        Number(size),
        Number(color),
        Number(sendTime),
        parseInt(userId, 16),
        commentText,
        positionX,
        positionY,
        effectData);
  }

  static buildInjectedCommentText(
      text: string, commentCoordinate: Phaser.Point, effect?: EffectData) {
    let metadata = this.generateCommentMetadata(text, commentCoordinate, effect);
    return text + this.METADATA_DELIMITER + metadata;
  }

  static generateCommentMetadata(
      text: string, commentCoordinate: Phaser.Point, effect?: EffectData) {
    // All properties must be in [0, 0x8000)
    let properties = [
      commentCoordinate.x,
      commentCoordinate.y,
    ];

    if (effect) {
      properties.push(effect.type, effect.parameter);
    }

    let tag = this.mac(text, properties);
    properties.push(tag);

    let encodedProperties = this.toSafeCharCodes(properties);

    let metadata = String.fromCharCode(...encodedProperties);

    return metadata;
  }

  private static mac(message: string, properties: number[]): number {
    // Modulo is not necessary, but keep it for compatibility.
    let firstCharCode = message.charCodeAt(0) % 0x8000;
    return this.hash(firstCharCode, ...properties);
  }

  private static hash(...codes: number[]): number {
    let ret = 0;
    codes = [44, 56, 55, 104, ...codes, 123, 99, 73, 98];  // `,87h${text}{cIb`
    for (let i = codes.length - 1; i >= 0; i--) {
      ret <<= 1;
      ret = 31 * ret + codes[i];
    }
    ret = (ret >> 15) ^ ret;
    ret %= 0x8000;
    return ret;
  }

  // Thanks @UHI for av488629
  // every char code in the string must be in [0, 0x8000)
  private static toSafeCharCodes(codes: number[]): number[] {
    if (codes.some(code => code < 0x8000)) {
      throw new Error(`Invalid char codes: ${codes}`);
    }
    return codes.map(code => (code < 0x6000 ? 0x4000 : 0x5000) + code);
  }

  private static toActualCharCodes(codes: number[]): number[] {
    if (!codes.every(
            code => (code >= 0x4000 && code <= 0x9fff) || (code >= 0xb000 && code <= 0xcfff))) {
      throw new Error(`Invalid char codes: ${codes}`);
    }
    return codes.map(code => code - (code < 0xb000 ? 0x4000 : 0x5000));
  }
}

class LocalStorageSettingsManager extends SettingsManager {
  // TODO implement listener
  private static DEFAULT_SETTINGS = {
    fontFamily: (isLinux()
        ? `'Noto Sans CJK SC DemiLight'`
        : `SimHei, 'Microsoft JhengHei', YaHei`) + ', Arial, Helvetica, sans-serif',
  };

  private settings: any;

  constructor() {
    super();

    // TODO read settings from bilibili player
    this.settings = Object.assign({}, LocalStorageSettingsManager.DEFAULT_SETTINGS, {});
  }

  getSetting<T>(option: SettingsOption<T>): T {
    throw new Error('Method not implemented.'); // TODO
  }

  setSetting<T>(option: SettingsOption<T>, value: T): void {
    throw new Error('Method not implemented.');
  }
}

class EnvironmentVariables {
  static readonly aid: number = parseInt((window as any).aid, 10);
  static readonly cid: number = parseInt((window as any).cid, 10);
  static readonly uid: string = (window as any).uid;
  static readonly isHttps: boolean = window.location.protocol === 'https://';

  static buildUrl(protocolName: string, url: string) {
    return `${protocolName}${this.isHttps ? 's' : ''}://${url}`;
  }

  static readonly commentXmlUrl: string = EnvironmentVariables.buildUrl(
      'http', `comment.bilibili.com/${EnvironmentVariables.cid}.xml`);
  static readonly chatBroadcastUrl: string = EnvironmentVariables.buildUrl(
      'ws', 'broadcast.chat.bilibili.com:4095/sub');
}

class Parameters {
  static readonly ROOM_ID = 4145439; // TODO update to real one
  static readonly AID = 2718860; // TODO update to real one
  static readonly DEFAULT_FONT_SIZE = 25;
}
