import UniverseProxy from '../../interface/UniverseProxy';
import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';

class UniverseProxyImpl implements UniverseProxy {
  constructor(
      private commentPlacingPolicy: CommentPlacingPolicy) {
  }

  getCommentPlacingPolicy() {
    return this.commentPlacingPolicy;
  }
}

export default UniverseProxyImpl;
