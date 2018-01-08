import CommentPlacingPolicy from './CommentPlacingPolicy';

interface UniverseProxy {
  getCommentPlacingPolicy(): CommentPlacingPolicy;
}

export default UniverseProxy;
