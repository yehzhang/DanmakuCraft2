import PermanentlyUpdatingBuff from './PermanentlyUpdatingBuff';
import {UpdatingCommentEntity} from '../../alias';
import ColorTransitionLaw from '../../../law/ColorTransitionLaw';
import {Phaser} from '../../../util/alias/phaser';

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
    this.redTransition.tick(time);
    this.greenTransition.tick(time);
    this.blueTransition.tick(time);

    let color = Phaser.Color.RGBtoString(
        this.redTransition.getValue(),
        this.greenTransition.getValue(),
        this.blueTransition.getValue());

    commentEntity.display.addColor(color, 0);
  }

  protected set(entity: UpdatingCommentEntity) {
  }
}

export default Chromatic;

export interface ColorTransition {
  tick(time: Phaser.Time): void;

  getValue(): number;
}

export class BouncingColorTransition implements ColorTransition {
  private static readonly MAX_VALUE = 255;
  private static readonly MIN_VALUE = 64;

  private static readonly TRANSITION_TICKS = 3;

  constructor(
      private law: ColorTransitionLaw,
      private a = 0,
      private value: number = BouncingColorTransition.getRandomValue(),
      private velocity: number = law.speedStrategy.next() * [1, -1][Number(Math.random() < 0.5)],
      private pauseInterval: number = 0) {
  }

  private static getRandomValue() {
    return Phaser.Math.between(this.MIN_VALUE, this.MAX_VALUE);
  }

  getValue() {
    return Math.round(this.value);
  }

  tick(time: Phaser.Time) {
    this.pauseInterval -= time.physicsElapsed;
    if (this.pauseInterval > 0) {
      return;
    }

    if (this.a < BouncingColorTransition.TRANSITION_TICKS) {
      this.a++;
      return;
    }
    this.a = 0;

    this.value += this.velocity * BouncingColorTransition.TRANSITION_TICKS;

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
