import {EventDispatcher, UnaryEvent} from '../util';
import {CommentData} from '../comment';

/**
 * Declares every classes with which the game can communicate with the environment.
 */
export interface EnvironmentAdapter {
  getGameContainerProvider(): GameContainerProvider;

  /**
   * Should only be invoked in {@link Universe.genesis}.
   */
  getCommentProvider(): CommentProvider;

  getSettingsProvider(): SettingsProvider;
}

/**
 * Returns an element that will become the container of the game.
 */
export interface GameContainerProvider {
  getContainer(): HTMLElement;
}

/**
 * Used by {@link CommentProvider} to dispatch a single new comment.
 */
export class NewCommentEvent extends UnaryEvent<CommentData> {
  static type = 'newComment';

  constructor(commentData: CommentData) {
    super(NewCommentEvent.type, commentData);
  }
}

/**
 * Provides all comments currently available, and dispatches a {@link NEW_COMMENT} event when a new
 * comment is available.
 */
export abstract class CommentProvider extends EventDispatcher<NewCommentEvent> {
  static NEW_COMMENT = NewCommentEvent.type;

  protected connected: boolean = false;

  /**
   * Call this method when it is appropriate.
   */
  abstract connect(): void;

  addEventListener(type: string, listener: (event: NewCommentEvent) => void, options?: any) {
    if (!this.connected) {
      throw new Error('CommentProvider is not connected');
    }
    return super.addEventListener(type, listener, options);
  }

  /**
   * Returns all comments currently available.
   * This operation is probably expensive, so listen on NEW_COMMENT for new comments.
   * Throws an error if fails to get all comments.
   */
  abstract async getAllComments(): Promise<CommentData[]>;
}

/**
 * Used by {@link CommentProvider} to dispatch a single new comment.
 */
export class NewSettingsEvent extends UnaryEvent<Settings> {
  static type = 'newSettings';

  constructor(settings: Settings) {
    super(NewSettingsEvent.type, settings);
  }
}

export class Settings {
  constructor(
      public readonly fontFamily: string) {
  }
}

export abstract class SettingsProvider extends EventDispatcher<NewSettingsEvent> {
  static NEW_SETTINGS = NewSettingsEvent.type;

  abstract getSettings(): Settings;
}
