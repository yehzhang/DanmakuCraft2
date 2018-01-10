export function bindFirst<T extends Node>(
    $elem: JQuery<T>,
    event: string,
    selector: JQuery.EventHandler<T>) {
  $elem.on(event, selector);

  let bindings = $elem.data('events')[event];
  bindings.unshift(bindings.pop());
}

export class WebSocketManager {
  WebSocket: new (url: string) => WebSocket;

  constructor() {
    this.WebSocket = (window as any).WebSocket || (window as any).MozWebSocket;
  }

  build(url: string): WebSocket {
    return new this.WebSocket(url);
  }
}

export function isLinux() {
  let ua = navigator.userAgent;
  return /Linux/i.test(ua);
}
