import EventDispatcher from '../event/EventDispatcher';
import {CommentData} from '../entity/comment';
import Event, {EventType} from '../event/Event';

/**
 * Provides all comments currently available, and dispatches a {@link NEW_COMMENT} event when a new
 * comment is available.
 */
export default abstract class CommentProvider extends EventDispatcher<EventType.COMMENT_NEW> {
  static readonly NEW_COMMENT = new Event<EventType.COMMENT_NEW, CommentData>();

  /**
   * Call this method when it is appropriate.
   */
  abstract connect(): void;

  /**
   * Returns all comments currently available.
   * This operation is probably expensive, so listen on NEW_COMMENT for new comments.
   * Throws an error if fails to get all comments.
   */
  abstract async getAllComments(): Promise<CommentData[]>;
}
