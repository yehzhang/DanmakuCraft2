import {CommentData} from '../comment';

export function bindFirst($elem: JQuery, event: string, selector: any) {
  $elem.on(event, selector);

  let bindings = $elem.data('events')[event];
  bindings.unshift(bindings.pop());
}

class WebSocketManager {
  WebSocket: new (url: string) => WebSocket;

  constructor() {
    let anyWindow: any = window;
    this.WebSocket = anyWindow.WebSocket || anyWindow.MozWebSocket;
  }

  build(url: string): WebSocket {
    return new this.WebSocket(url);
  }
}

export const webSocketManager = new WebSocketManager();


export class CommentDataUtil {
  static parseFromXmlStrings(attributes: string, text: string) {
    let words = attributes.split(',');
    let showTime = parseFloat(words[0]);
    let mode = Number(words[1]);
    let size = Number(words[2]);
    let color = Number(words[3]);
    let sendTime = Number(words[4]);
    let userId = Number(words[6]);

    let comment = new CommentData(showTime, mode, size, color, sendTime, userId, text);

    return comment;
  }

  static generateCommentMetadata(text: string, commentX: number, commentY: number) {
    // All properties must be in [0, 0x8000)
    let properties = [
      commentX,
      commentY,
    ];

    // // TODO EffectManager.apply?
    // if (player.effect) {
    //   properties.push(player.effect.type, player.effect.behavior);
    //   player.effect = null; // effect is consumed
    // }

    let firstCharCode = text.charCodeAt(0) % 0x8000;  // not necessary
    let tag = this.hash(firstCharCode, ...properties);
    properties.push(tag);

    let encodedProperties = this.toSafeCharCodes(properties);

    let metadata = '/[' + String.fromCharCode(...encodedProperties);

    return metadata;
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
}
