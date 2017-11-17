import SettingsManager from './SettingsManager';
import CommentProvider from './CommentProvider';
import GameContainerProvider from './GameContainerProvider';

/**
 * Declares every classes with which the game can communicate with the environment.
 */
export default interface EnvironmentAdapter {
  getGameContainerProvider(): GameContainerProvider;

  /**
   * Should only be invoked in {@link Universe.genesis}.
   */
  getCommentProvider(): CommentProvider;

  getSettingsManager(): SettingsManager;
}
