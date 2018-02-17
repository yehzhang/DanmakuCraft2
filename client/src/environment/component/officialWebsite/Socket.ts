import socketIOClient = require('socket.io-client');
import SailsIOJS = require('sails.io.js');
import ConfigProvider from '../../config/ConfigProvider';
import Response, {ErrorResponse} from './Response';
import Sleep from '../../../util/async/Sleep';

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
      await this.checkConnection();
    } catch (e) {
      return new ErrorResponse(`Failed to establish socket connection for '${e}'.`);
    }

    let message = await new Promise(
        resolve => this.socket.get(Socket.toPath(eventIdentity), data, resolve));
    return Response.from(message);
  }

  async post<T>(eventIdentity: string, data: { [key: string]: any }): Promise<Response<T> | null> {
    try {
      await this.checkConnection();
    } catch (e) {
      return new ErrorResponse(`Failed to establish socket connection for '${e}'.`);
    }

    let message = await new Promise(
        resolve => this.socket.post(Socket.toPath(eventIdentity), data, resolve));
    return Response.from(message);
  }

  private async checkConnection() {
    if (this.socket.isConnected()) {
      return;
    }

    if (!this.socket.isConnecting()) {
      this.socket.reconnect();
      return;
    }

    for (let i = 0; i < 50; i++) {
      await Sleep.after(0.1 * Phaser.Timer.SECOND);
      if (this.socket.isConnected()) {
        return;
      }
    }
    throw new TypeError('Timed out while waiting for connecting');
  }
}

export default Socket;
