import CommentData from '../../comment/CommentData';

/**
 * Provides all comments currently available, and dispatches a {@link NEW_COMMENT} event when a new
 * comment is available.
 */
interface CommentProvider {
  readonly commentReceived: Phaser.Signal<CommentData>;

  /**
   * Call this method when it is appropriate.
   */
  connect(): void;

  /**
   * Returns all comments currently available.
   * This operation is probably expensive, so listen on NEW_COMMENT for new comments.
   * Throws an error if fails to get all comments.
   */
  getAllComments(): Promise<CommentData[]>;
}

export default CommentProvider;
