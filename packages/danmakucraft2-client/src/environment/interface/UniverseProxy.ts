import CommentPlacingPolicy from './CommentPlacingPolicy';
import Notifier from '../../render/notification/Notifier';

interface UniverseProxy {
  getCommentPlacingPolicy(): CommentPlacingPolicy;

  getNotifier(): Notifier;
}

export default UniverseProxy;
