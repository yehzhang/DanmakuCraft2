import EnvironmentAdapter from './interface/EnvironmentAdapter';
import UniverseProxy from './interface/UniverseProxy';
import GameContainerProvider from './interface/GameContainerProvider';
import CommentProvider from './interface/CommentProvider';
import SettingsManager from './interface/SettingsManager';

/**
 * Declares every classes with which the game can communicate with the environment.
 */
abstract class BaseEnvironmentAdapter implements EnvironmentAdapter {
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

export default BaseEnvironmentAdapter;
