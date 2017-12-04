import {Player} from './entity';
import GraphicsFactory from '../render/graphics/GraphicsFactory';
import BuffFactory from '../buff/BuffFactory';

export class TinyTelevision extends Player {
  private static readonly WALK_ANIMATION_NAME = 'walk';

  private moved: boolean;

  constructor(
      coordinate: Phaser.Point,
      graphicsFactory: GraphicsFactory,
      buffFactory: BuffFactory) {
    let sprite = TinyTelevision.generateSprite(graphicsFactory);
    super(coordinate, sprite);

    this.buffManager.activate(buffFactory.makeInputControllerMover());

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

    sprite.animations.add(TinyTelevision.WALK_ANIMATION_NAME, undefined, 12, true);

    return sprite;
  }

  moveBy(offsetX: number, offsetY: number) {
    super.moveBy(offsetX, offsetY);
    this.moved = true;
  }

  tick(): void {
    super.tick();

    if (this.moved) {
      this.sprite.animations.play(TinyTelevision.WALK_ANIMATION_NAME);
      this.moved = false;
    } else {
      this.sprite.animations.stop(TinyTelevision.WALK_ANIMATION_NAME, true);
    }
  }
}
