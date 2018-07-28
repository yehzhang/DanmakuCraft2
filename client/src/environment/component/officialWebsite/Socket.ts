import SailsIOJS = require('sails.io.js');
import socketIOClient = require('socket.io-client');
import ConfigProvider from '../../config/ConfigProvider';
import Response, {ErrorResponse} from './Response';

const io = SailsIOJS(socketIOClient);
io.sails.autoConnect = false;
io.sails.environment = __DEV__ ? 'development' : 'production';

class Socket {
  constructor(private socket: SailsIOJS.Socket = io.sails.connect(ConfigProvider.get().baseUrl)) {
  }

  on<T>(eventIdentity: string, callback: (response: T) => void) {
    this.socket.on(eventIdentity, message => {
      if (message.data == null) {
        console.error(`Received invalid event message: '${message}'`);
        return;
      }
      callback(message.data);
    });
  }

  async get<T>(
      eventIdentity: string, data: { [key: string]: any } = {}): Promise<Response<T> | null> {
    try {
      this.checkConnection();
    } catch (e) {
      return new ErrorResponse(`Failed to establish socket connection for '${e}'.`);
    }

    const message = await new Promise(
        resolve => this.socket.get(toPath(eventIdentity), data, resolve));
    return Response.from(message);
  }

  async post<T>(eventIdentity: string, data: { [key: string]: any }): Promise<Response<T> | null> {
    try {
      this.checkConnection();
    } catch (e) {
      return new ErrorResponse(`Failed to establish socket connection for '${e}'.`);
    }

    const message = await new Promise(
        resolve => this.socket.post(toPath(eventIdentity), data, resolve));
    return Response.from(message);
  }

  private checkConnection() {
    if (this.socket.isConnected()) {
      return;
    }

    if (this.socket.isConnecting()) {
      return;
    }
    this.socket.reconnect();
  }
}

function toPath(eventIdentity: string) {
  return '/' + eventIdentity;
}

export default Socket;
