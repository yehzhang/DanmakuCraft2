import socketIOClient = require('socket.io-client');
import SailsIOJS = require('sails.io.js');
import ConfigProvider from '../../config/ConfigProvider';
import Response from './Response';

const io = SailsIOJS(socketIOClient);
io.sails.autoConnect = false;
io.sails.environment = __STAGE__ ? 'development' : 'production';

class Socket {
  constructor(private socket: SailsIOJS.Socket = io.sails.connect(ConfigProvider.get().baseUrl)) {
    // TODO
    // io.sails.headers = {
    //   "x-csrf-token": someToken,
    // };
  }

  on<T>(path: string, callback: (response: Response<T>) => void) {
    this.socket.on(path, message => {
      let response = Response.from(message);
      if (response == null) {
        return;
      }
      callback(message);
    });
  }

  async get<T>(path: string, data: { [key: string]: string } = {}): Promise<Response<T> | null> {
    if (__STAGE__) {
      if (!('count' in data)) {
        data.count = '5000';
      }
    }

    // TODO timeout
    let message = await new Promise(resolve => this.socket.get(path, data, resolve));
    return Response.from(message);
  }

  async post<T>(path: string, data: any): Promise<Response<T> | null> {
    // TODO timeout
    let message = await new Promise(resolve => this.socket.post(path, data, resolve));
    return Response.from(message);
  }
}

export default Socket;
