import CommentData from '../../comment/CommentData';
import Provider from '../../util/syntax/Provider';

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
  getAllComments(): Promise<Provider<CommentData[]>>;
}

export default CommentProvider;
