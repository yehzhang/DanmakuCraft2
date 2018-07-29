import CommentProvider from './interface/CommentProvider';
import EnvironmentAdapter from './interface/EnvironmentAdapter';
import GameContainerProvider from './interface/GameContainerProvider';
import SettingsManager from './interface/SettingsManager';
import UniverseProxy from './interface/UniverseProxy';

/**
 * Declares every classes with which the game can communicate with the environment.
 */
abstract class BaseEnvironmentAdapter implements EnvironmentAdapter {
  abstract getGameContainerProvider(): GameContainerProvider;

  abstract getCommentProvider(): CommentProvider;

  abstract getSettingsManager(): SettingsManager;

  abstract setProxy(universeProxy: UniverseProxy): void;
}

export default BaseEnvironmentAdapter;
