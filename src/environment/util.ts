export function bindFirst($elem: JQuery<any>, event: string, selector: any) {
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

export function isLinux() {
  let ua = navigator.userAgent;
  return /Linux/i.test(ua);
}
