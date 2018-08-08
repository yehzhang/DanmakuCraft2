import ColorTransitionLaw from '../../../law/ColorTransitionLaw';
import {Phaser} from '../../../util/alias/phaser';
import {UpdatingCommentEntity} from '../../alias';
import PermanentlyUpdatingBuff from './PermanentlyUpdatingBuff';

const TICKS_PER_UPDATE = 3;

/**
 * Makes a {@link CommentEntity} constantly change its color.
 */
class Chromatic extends PermanentlyUpdatingBuff<UpdatingCommentEntity> {

  constructor(
      private redTransition: ColorTransition,
      private blueTransition: ColorTransition,
      private greenTransition: ColorTransition,
      private ticksSinceLastUpdate = 1) {
    super();
  }

  tick(commentEntity: UpdatingCommentEntity, time: Phaser.Time) {
    if (Math.random() >= 1 / TICKS_PER_UPDATE) {
      this.ticksSinceLastUpdate++;
      return;
    }
    this.ticksSinceLastUpdate = 1;

    this.redTransition.tick(time, this.ticksSinceLastUpdate);
    this.greenTransition.tick(time, this.ticksSinceLastUpdate);
    this.blueTransition.tick(time, this.ticksSinceLastUpdate);

    const color = Phaser.Color.RGBtoString(
        this.redTransition.getValue(),
        this.greenTransition.getValue(),
        this.blueTransition.getValue());

    commentEntity.display.addColor(color, 0);

    commentEntity.display.updateCache();
  }

  protected set(entity: UpdatingCommentEntity) {
  }
}

export default Chromatic;

export interface ColorTransition {
  tick(time: Phaser.Time, ticksSinceLastUpdate: number): void;

  getValue(): number;
}

export class BouncingColorTransition implements ColorTransition {
  private static readonly MAX_VALUE = 255;
  private static readonly MIN_VALUE = 64;

  constructor(
      private law: ColorTransitionLaw,
      private value: number = BouncingColorTransition.getRandomValue(),
      private velocity: number = law.speedStrategy.next() * [1, -1][Number(Math.random() < 0.5)],
      private pauseInterval: number = 0) {
  }

  private static getRandomValue() {
    return Phaser.Math.between(
        BouncingColorTransition.MIN_VALUE,
        BouncingColorTransition.MAX_VALUE);
  }

  getValue() {
    return Math.round(this.value);
  }

  tick(time: Phaser.Time, ticksSinceLastUpdate: number) {
    this.pauseInterval -= time.physicsElapsedMS * ticksSinceLastUpdate;
    if (this.pauseInterval > 0) {
      return;
    }

    this.value += this.velocity * ticksSinceLastUpdate;

    if (this.value > BouncingColorTransition.MAX_VALUE) {
      this.value = BouncingColorTransition.MAX_VALUE;
      this.velocity = -this.law.speedStrategy.next();
    } else if (this.value < BouncingColorTransition.MIN_VALUE) {
      this.value = BouncingColorTransition.MIN_VALUE;
      this.velocity = this.law.speedStrategy.next();
    }

    if (this.law.pauseStrategy.next()) {
      this.pauseInterval = this.law.pauseIntervalStrategy.next();
    }
  }
}
