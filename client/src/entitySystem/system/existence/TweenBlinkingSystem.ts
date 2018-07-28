import {PIXI} from '../../../util/alias/phaser';
import Blink from '../../component/Blink';
import Display from '../../component/Display';
import RegisteredTimes from '../../component/RegisteredTimes';
import ExistenceSystem from './ExistenceSystem';

type Target = Display<PIXI.DisplayObject> & RegisteredTimes & Blink;

class TweenBlinkingSystem implements ExistenceSystem<Target> {
  private static readonly BLINK_DURATION = 0.3 * Phaser.Timer.SECOND;

  constructor(private game: Phaser.Game) {
  }

  async adopt(entity: Target) {
    if (!entity.isFirstTimeRegistered()) {
      return;
    }

    entity.setBlink(this.blink(entity.display));
  }

  abandon() {
  }

  private blink(display: PIXI.DisplayObject) {
    return this.game.add.tween(display)
        .to(
            {alpha: 0},
            TweenBlinkingSystem.BLINK_DURATION / 2,
            Phaser.Easing.Linear.None,
            true,
            0,
            1,
            true);
  }
}

export default TweenBlinkingSystem;
