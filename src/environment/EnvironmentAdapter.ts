import SettingsManager from './SettingsManager';
import CommentProvider from './CommentProvider';
import GameContainerProvider from './GameContainerProvider';
import UniverseProxy from './UniverseProxy';

/**
 * Declares every classes with which the game can communicate with the environment.
 */
export default interface EnvironmentAdapter {
  getGameContainerProvider(): GameContainerProvider;

  getCommentProvider(): CommentProvider;

  getSettingsManager(): SettingsManager;

  setProxy(universeProxy: UniverseProxy): void;
}
