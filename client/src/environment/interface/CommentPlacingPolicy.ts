import CommentData from '../../comment/CommentData';

interface CommentPlacingPolicy {
  /**
   * Checks if the comment can fit in its place.
   * Triggers some notification in game if request is rejected.
   */
  requestFor(text: string, size: number, color: number): CommentData | null;

  commitRequest(): void;

  cancelRequest(): void;
}

export default CommentPlacingPolicy;
