import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';
import CommentData from '../../../comment/CommentData';
import CollisionDetectionSystem from '../../../entitySystem/system/visibility/CollisionDetectionSystem';
import BuffDataContainer from '../../../entitySystem/system/buff/BuffDataContainer';
import CommentLoader from '../../../comment/CommentLoader';
import Notifier, {NotificationPriority} from '../../../output/notification/Notifier';
import {CommentEntity, Player} from '../../../entitySystem/alias';
import {BuffData, BuffType} from '../../../entitySystem/system/buff/BuffData';
import Texts from '../../../render/Texts';

class CommentPlacingPolicyImpl implements CommentPlacingPolicy {
  constructor(
      private collisionDetectionSystem: CollisionDetectionSystem,
      private commentLoader: CommentLoader,
      private notifier: Notifier,
      private buffDataContainer: BuffDataContainer,
      private player: Player,
      private previewEntity?: CommentEntity) {
  }

  requestFor(text: string, size: number, color: number) {
    this.clearCommentPreview();

    let commentData = this.buildCommentData(text, size, color);
    this.previewEntity = this.commentLoader.load(commentData);

    if (!this.collisionDetectionSystem.collidesWith(this.previewEntity)) {
      this.previewEntity.display.alpha = 0.7;
      return commentData;
    }

    this.notifier.send(
        Texts.forName('main.comment.insert.collision'), NotificationPriority.OVERRIDE);

    this.clearCommentPreview();

    return null;
  }

  commitRequest() {
    if (this.buffDataContainer.hasBuff()) {
      this.buffDataContainer.pop();
    }
    this.clearCommentPreview();
  }

  cancelRequest() {
    this.clearCommentPreview();
  }

  private clearCommentPreview() {
    if (this.previewEntity === undefined) {
      return;
    }

    this.commentLoader.unload(this.previewEntity);
    this.previewEntity = undefined;
  }

  private buildCommentData(text: string, size: number, color: number) {
    let buffData = this.buffDataContainer.peek(new BuffData(BuffType.NONE));
    return new CommentData(size, color, text, this.player.coordinates, buffData);
  }
}

export default CommentPlacingPolicyImpl;
