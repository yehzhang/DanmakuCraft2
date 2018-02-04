import socketIOClient = require('socket.io-client');
import SailsIOJS = require('sails.io.js');
import ConfigProvider from '../../config/ConfigProvider';
import Response, {ErrorResponse} from './Response';
import Texts from '../../../render/Texts';

const io = SailsIOJS(socketIOClient);
io.sails.autoConnect = false;
io.sails.environment = __DEV__ ? 'development' : 'production';

class Socket {
  constructor(private socket: SailsIOJS.Socket = io.sails.connect(ConfigProvider.get().baseUrl)) {
  }

  private static toPath(eventIdentity: string) {
    return '/' + eventIdentity;
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
    } catch {
      return new ErrorResponse(Texts.forName('main.socket.connectBroken'));
    }

    let message = await new Promise(
        resolve => this.socket.get(Socket.toPath(eventIdentity), data, resolve));
    return Response.from(message);
  }

  async post<T>(eventIdentity: string, data: { [key: string]: any }): Promise<Response<T> | null> {
    try {
      this.checkConnection();
    } catch {
      return new ErrorResponse(Texts.forName('main.socket.connectBroken'));
    }

    let message = await new Promise(
        resolve => this.socket.post(Socket.toPath(eventIdentity), data, resolve));
    return Response.from(message);
  }

  private checkConnection() {
    if (this.socket.isConnected()) {
      return;
    }
    this.socket.reconnect();
  }
}

export default Socket;
