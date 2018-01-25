import socketIOClient = require('socket.io-client');
import SailsIOJS = require('sails.io.js');
import ConfigProvider from '../../config/ConfigProvider';
import Response from './Response';

const io = SailsIOJS(socketIOClient);
io.sails.autoConnect = false;
io.sails.environment = __DEV__ ? 'development' : 'production';

class Socket {
  constructor(private socket: SailsIOJS.Socket = io.sails.connect(ConfigProvider.get().baseUrl)) {
    // TODO
    // io.sails.headers = {
    //   "x-csrf-token": someToken,
    // };
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
    if (__DEV__) {
      if (!('count' in data)) {
        data.count = '5000';
      }
    }

    // TODO timeout
    let message = await new Promise(
        resolve => this.socket.get(Socket.toPath(eventIdentity), data, resolve));
    return Response.from(message);
  }

  async post<T>(eventIdentity: string, data: { [key: string]: any }): Promise<Response<T> | null> {
    // TODO timeout
    let message = await new Promise(
        resolve => this.socket.post(Socket.toPath(eventIdentity), data, resolve));
    return Response.from(message);
  }
}

export default Socket;
