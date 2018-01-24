import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';
import CommentData from '../../../comment/CommentData';
import CollisionDetectionSystem from '../../../entitySystem/system/visibility/CollisionDetectionSystem';
import BuffDataContainer from '../../../entitySystem/system/buff/BuffDataContainer';
import Notifier, {NotificationPriority} from '../../../output/notification/Notifier';
import {Player} from '../../../entitySystem/alias';
import {BuffData, BuffType} from '../../../entitySystem/system/buff/BuffData';
import Texts from '../../../render/Texts';
import Point from '../../../util/syntax/Point';
import GraphicsFactory from '../../../render/graphics/GraphicsFactory';
import Display from '../../../entitySystem/component/Display';

class CommentPlacingPolicyImpl implements CommentPlacingPolicy {
  // Maximum blur radius = 2. Minimum line padding = 9.
  // Multiply by 2 because bounds of comments in collision system are not shrunk,
  private static readonly COLLISION_BOUNDS_SHRINKAGE = Point.of(2, 9 / 2 + 2).multiply(2, 2).add(2, 2);

  constructor(
      private collisionDetectionSystem: CollisionDetectionSystem,
      private graphicsFactory: GraphicsFactory,
      private notifier: Notifier,
      private buffDataContainer: BuffDataContainer,
      private player: Player,
      private fixedToCameraLayer: PIXI.DisplayObjectContainer,
      private previewDisplay?: Phaser.Text) {
  }

  requestFor(text: string, size: number, color: number) {
    this.clearCommentPreview();

    this.previewDisplay =
        this.graphicsFactory.createText(text, size, Phaser.Color.getWebRGB(color));
    this.previewDisplay.anchor.setTo(0.5);
    this.fixedToCameraLayer.addChild(this.previewDisplay);

    let bounds = Display.getWorldBounds(this.previewDisplay, this.player)
        .inflate(
            -CommentPlacingPolicyImpl.COLLISION_BOUNDS_SHRINKAGE.x,
            -CommentPlacingPolicyImpl.COLLISION_BOUNDS_SHRINKAGE.y);
    if (!this.collisionDetectionSystem.collidesIn(bounds)) {
      this.previewDisplay.alpha = 0.7;
      return this.buildCommentData(text, size, color);
    }

    this.notifier.send(
        Texts.forName('main.comment.insert.collision'), NotificationPriority.OVERRIDE);

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
    if (this.previewDisplay === undefined) {
      return;
    }

    this.fixedToCameraLayer.removeChild(this.previewDisplay);
    this.previewDisplay = undefined;
  }

  private buildCommentData(text: string, size: number, color: number) {
    let buffData = this.buffDataContainer.peek(new BuffData(BuffType.NONE));
    return new CommentData(size, color, text, this.player.coordinates, buffData);
  }
}

export default CommentPlacingPolicyImpl;
