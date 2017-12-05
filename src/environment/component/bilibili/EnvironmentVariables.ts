export default class EnvironmentVariables {
  static readonly aid: number = parseInt((window as any).aid, 10);
  static readonly cid: number = parseInt((window as any).cid, 10);
  static readonly uid: string = (window as any).uid;
  static readonly isHttps: boolean = window.location.protocol === 'https://';
  static readonly commentXmlUrl: string = EnvironmentVariables.buildUrl(
      'http', `comment.bilibili.com/${EnvironmentVariables.cid}.xml`);
  static readonly chatBroadcastUrl: string = EnvironmentVariables.buildUrl(
      'ws', 'broadcast.chat.bilibili.com:4095/sub');

  static buildUrl(protocolName: string, url: string) {
    return `${protocolName}${this.isHttps ? 's' : ''}://${url}`;
  }
}
