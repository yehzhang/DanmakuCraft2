import GraphicsFactory from '../render/graphics/GraphicsFactory';
import BuffFactory from '../buff/BuffFactory';
import {TinyTelevision} from './player';
import {CommentData, CommentEntity} from './comment';
import EffectFactory from '../effect/EffectFactory';

/**
 * Factory class for making entities.
 */
export default class EntityFactory {
  constructor(
      private game: Phaser.Game,
      private graphicsFactory: GraphicsFactory,
      private buffFactory: BuffFactory,
      private effectFactory: EffectFactory) {
  }

  spawnPlayer() {
    return new TinyTelevision(
        this.getRandomPlayerSpawnPoint(),
        this.graphicsFactory,
        this.buffFactory);
  }

  createCommentEntity(data: CommentData) {
    let coordinate = new Phaser.Point(data.coordinateX, data.coordinateY);
    let comment = new CommentEntity(
        data.size,
        data.color,
        data.text,
        coordinate,
        this.graphicsFactory);

    if (data.effectData != null) {
      let effect = this.effectFactory.create(data.effectData);
      effect.apply(comment);
    }

    return comment;
  }

  private getRandomPlayerSpawnPoint(): Phaser.Point {
    return new Phaser.Point(this.game.world.centerX, this.game.world.centerY).floor(); // TODO
  }
}
