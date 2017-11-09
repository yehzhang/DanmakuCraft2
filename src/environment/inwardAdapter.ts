import {EventDispatcher, EventType} from '../util';
import {CommentData} from '../comment';

/**
 * Declares every classes with which the game can communicate with the environment.
 */
export interface EnvironmentAdapter {
  getGameContainerProvider(): GameContainerProvider;

  getCommentProvider(): CommentProvider;
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
export class NewCommentEvent extends CustomEvent {
  static type: EventType = 'newComment';

  constructor(comment: CommentData) {
    super(NewCommentEvent.type, {detail: comment});
  }
}

/**
 * Provides all comments currently available, and dispatches a {@link NEW_COMMENT} event when a new
 * comment is available.
 */
export abstract class CommentProvider extends EventDispatcher<NewCommentEvent> {
  static NEW_COMMENT: EventType = NewCommentEvent.type;

  /**
   * Returns all comments currently available.
   * This operation is probably expensive, so listen on NEW_COMMENT for new comments.
   */
  abstract async getAllComments(): Promise<CommentData[]>;
}
