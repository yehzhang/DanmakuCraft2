import PermanentlyUpdatingBuff from './PermanentlyUpdatingBuff';
import {UpdatingCommentEntity} from '../../alias';
import DataGenerator from '../../../util/dataGenerator/DataGenerator';

/**
 * Makes a {@link CommentEntity} constantly change its color.
 */
class Chromatic extends PermanentlyUpdatingBuff<UpdatingCommentEntity> {
  constructor(
      private redTransition: ColorTransition,
      private blueTransition: ColorTransition,
      private greenTransition: ColorTransition) {
    super();
  }

  tick(commentEntity: UpdatingCommentEntity, time: Phaser.Time) {
    this.redTransition.tick();
    this.greenTransition.tick();
    this.blueTransition.tick();

    let color = Phaser.Color.RGBtoString(
        this.redTransition.getValue(),
        this.greenTransition.getValue(),
        this.blueTransition.getValue());

    commentEntity.display.addColor(color, 0);
  }
}

export default Chromatic;

export interface ColorTransition {
  tick(): void;

  getValue(): number;
}

export class BouncingColorTransition implements ColorTransition {
  private static readonly MAX_VALUE = 255;
  private static readonly MIN_VALUE = 64;

  constructor(
      private speedGenerator: DataGenerator,
      private velocity: number = speedGenerator.next() * [1, -1][Math.random() < 0.5 ? 1 : 0],
      private value: number = BouncingColorTransition.getRandomValue()) {
  }

  private static getRandomValue() {
    return Phaser.Math.random(this.MIN_VALUE, this.MAX_VALUE);
  }

  getValue() {
    return Math.round(this.value);
  }

  tick() {
    this.value += this.velocity;

    if (this.value > BouncingColorTransition.MAX_VALUE) {
      this.value = BouncingColorTransition.MAX_VALUE;
      this.velocity = -this.speedGenerator.next();
    } else if (this.value < BouncingColorTransition.MIN_VALUE) {
      this.value = BouncingColorTransition.MIN_VALUE;
      this.velocity = this.speedGenerator.next();
    }
  }
}
