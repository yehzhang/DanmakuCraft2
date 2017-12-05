import SettingsManager from './SettingsManager';
import CommentProvider from './CommentProvider';
import GameContainerProvider from './GameContainerProvider';
import UniverseProxy from './UniverseProxy';

/**
 * Declares every classes with which the game can communicate with the environment.
 */
export default abstract class EnvironmentAdapter {
  protected universeProxy: UniverseProxy;

  abstract getGameContainerProvider(): GameContainerProvider;

  abstract getCommentProvider(): CommentProvider;

  abstract getSettingsManager(): SettingsManager;

  setProxy(universeProxy: UniverseProxy) {
    this.universeProxy = universeProxy;
    this.onProxySet();
  }

  abstract onProxySet(): void;
}
