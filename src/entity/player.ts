import {Player} from './entity';
import GraphicsFactory from '../render/graphics/GraphicsFactory';
import BuffFactory from '../buff/BuffFactory';

export class TinyTelevision extends Player {
  private walkingAnimation: Phaser.Animation;
  private moved: boolean;

  constructor(
      coordinate: Phaser.Point,
      graphicsFactory: GraphicsFactory,
      buffFactory: BuffFactory) {
    let sprite = TinyTelevision.generateSprite(graphicsFactory);
    super(coordinate, sprite);

    this.buffManager.activate(buffFactory.makeInputControllerMover());

    this.walkingAnimation = sprite.animations.add('', undefined, 12, true);
    this.moved = false;
  }

  private static generateSprite(graphicsFactory: GraphicsFactory): Phaser.Sprite {
    let sprite = graphicsFactory.newTinyTelevisionBuilder()
        .pushFrame(0)
        .withShadow()
        .pushFrame(1)
        .withShadow()
        .pushFrame(2)
        .withShadow()
        .toSprite();
    sprite.anchor.setTo(0.5);

    return sprite;
  }

  moveBy(offsetX: number, offsetY: number) {
    super.moveBy(offsetX, offsetY);
    this.moved = true;
  }

  tick(): void {
    super.tick();

    if (this.moved) {
      if (!this.walkingAnimation.isPlaying) {
        this.walkingAnimation.play();
        this.walkingAnimation.frame = 1;
      }
      this.moved = false;
    } else {
      if (this.walkingAnimation.isPlaying) {
        this.walkingAnimation.stop(true);
      }
    }
  }
}
