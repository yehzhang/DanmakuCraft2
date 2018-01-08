import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';
import CommentData from '../../../comment/CommentData';
import CollisionDetectionSystem from '../../../entitySystem/system/existence/CollisionDetectionSystem';
import BuffDataContainer from '../../../comment/BuffDataContainer';
import CommentLoader from '../../../comment/CommentLoader';
import Notifier from '../../../render/notification/Notifier';
import TickCallbackRegister from '../../../update/TickCallbackRegister';
import {CommentEntity, Player} from '../../../entitySystem/alias';
import {BuffData, BuffType} from '../../../entitySystem/system/buff/BuffFactory';

class CommentPlacingPolicyImpl implements CommentPlacingPolicy {
  constructor(
      private collisionDetectionSystem: CollisionDetectionSystem,
      private commentLoader: CommentLoader,
      private notifier: Notifier,
      private buffDataContainer: BuffDataContainer,
      private player: Player,
      private tickCallbackRegister: TickCallbackRegister,
      private previewDisplay?: CommentEntity) {
  }

  async requestFor(text: string, size: number, color: number) {
    this.clearCommentPreview();

    let commentData = this.buildCommentData(text, size, color);
    let comment = this.previewDisplay = this.commentLoader.load(commentData, false, false);

    let canPlaceComment = await this.tickCallbackRegister.for(() => {
      comment.display.alpha = 0.8;

      if (this.collisionDetectionSystem.collidesWith(comment.display)) {
        return false;
      }
      return true;
    });

    if (canPlaceComment) {
      return commentData;
    }

    this.clearCommentPreview();

    return null;
  }

  commitRequest() {
    this.buffDataContainer.pop();
    this.clearCommentPreview();
  }

  cancelRequest() {
    this.clearCommentPreview();
  }

  private clearCommentPreview() {
    if (this.previewDisplay === undefined) {
      return;
    }

    this.commentLoader.unload(this.previewDisplay);
    this.previewDisplay = undefined;
  }

  private buildCommentData(text: string, size: number, color: number) {
    let buffData = this.buffDataContainer.peek(new BuffData(BuffType.NONE));
    return new CommentData(size, color, text, this.player.coordinates, buffData);
  }
}

export default CommentPlacingPolicyImpl;
