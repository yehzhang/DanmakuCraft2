export function bindFirst<T extends Node>(
    element: JQuery<T>,
    event: string,
    selector: JQuery.EventHandler<T>) {
  element.on(event, selector);

  let events = element.data('events');
  if (events == null) {
    element.on(event, selector);
    return;
  }

  let bindings = events[event];
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
