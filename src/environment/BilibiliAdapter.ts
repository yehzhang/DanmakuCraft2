import EnvironmentAdapter from './interface/EnvironmentAdapter';
import UniverseProxy from './interface/UniverseProxy';
import CommentProvider from './interface/CommentProvider';
import GameContainerProvider from './interface/GameContainerProvider';
import SettingsManager from './interface/SettingsManager';
import BilibiliContainerProvider from './component/bilibili/BilibiliContainerProvider';
import BilibiliCommentProvider from './component/bilibili/BilibiliCommentProvider';
import LocalStorageSettingsManager from './component/bilibili/LocalStorageSettingsManager';
import LocalCommentInjector from './component/bilibili/LocalCommentInjector';

export default class BilibiliAdapter implements EnvironmentAdapter {
  private universeProxy: UniverseProxy;
  private injector: LocalCommentInjector;

  constructor() {
    if (!BilibiliAdapter.canRunOnThisWebPage()) {
      throw new Error('Script cannot run on this page');
    }
  }

  private static canRunOnThisWebPage() {
    return EnvironmentVariables.aid === Parameters.AID;
  }

  setProxy(universeProxy: UniverseProxy) {
    this.universeProxy = universeProxy;
    this.injector = new LocalCommentInjector(universeProxy);
  }

  getCommentProvider(): CommentProvider {
    return new BilibiliCommentProvider();
  }

  getGameContainerProvider(): GameContainerProvider {
    return new BilibiliContainerProvider();
  }

  getSettingsManager(): SettingsManager {
    return new LocalStorageSettingsManager();
  }
}

export class EnvironmentVariables {
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

export class Parameters {
  static readonly ROOM_ID = 4145439; // TODO update to real one
  static readonly AID = 2718860; // TODO update to real one
  static readonly DEFAULT_FONT_SIZE = 25;
}
