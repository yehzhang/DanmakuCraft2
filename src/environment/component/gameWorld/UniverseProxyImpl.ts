import UniverseProxy from '../../interface/UniverseProxy';
import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';
import Notifier from '../../../render/notification/Notifier';

class UniverseProxyImpl implements UniverseProxy {
  constructor(private commentPlacingPolicy: CommentPlacingPolicy, private notifier: Notifier) {
  }

  getCommentPlacingPolicy() {
    return this.commentPlacingPolicy;
  }

  getNotifier(): Notifier {
    return this.notifier;
  }
}

export default UniverseProxyImpl;
