import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';
import CommentData from '../../../comment/CommentData';
import CollisionDetectionSystem from '../../../entitySystem/system/existence/CollisionDetectionSystem';
import BuffDataContainer from '../../../comment/BuffDataContainer';
import CommentLoader from '../../../comment/CommentLoader';
import Notifier, {NotificationPriority} from '../../../render/notification/Notifier';
import TickCallbackRegister from '../../../update/TickCallbackRegister';
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
      private tickCallbackRegister: TickCallbackRegister,
      private isProcessingRequest: boolean = false,
      private shouldClearPreview: boolean = false,
      private previewDisplay?: CommentEntity) {
  }

  async requestFor(text: string, size: number, color: number) {
    if (this.isProcessingRequest) {
      throw new TypeError('Cannot process more than one request at the same time');
    }

    this.clearCommentPreview();

    let commentData = this.buildCommentData(text, size, color);
    let comment = this.previewDisplay = this.commentLoader.load(commentData, false);

    this.isProcessingRequest = true;
    await this.tickCallbackRegister.forDisplay(() => comment.display.alpha = 0.8);
    let hasCollision = await this.tickCallbackRegister.forDisplayPosition(
        () => this.collisionDetectionSystem.collidesWith(comment.display));
    this.isProcessingRequest = false;

    if (!hasCollision) {
      if (this.shouldClearPreview) {
        this.clearCommentPreview();
        this.shouldClearPreview = false;
      }
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
    if (this.isProcessingRequest) {
      this.shouldClearPreview = true;
      return;
    }

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
