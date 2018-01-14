import ExistenceSystem from './ExistenceSystem';
import Display from '../../component/Display';
import {PIXI} from '../../../util/alias/phaser';
import DynamicProvider from '../../../util/DynamicProvider';
import RegisteredTimes from '../../component/RegisteredTimes';
import Blink from '../../component/Blink';

type Target = Display<PIXI.DisplayObject> & RegisteredTimes & Blink;

class TweenBlinkingSystem implements ExistenceSystem<Target> {
  private static readonly BLINK_DURATION = 0.3 * Phaser.Timer.SECOND;

  constructor(private game: Phaser.Game, private isGameStarted: DynamicProvider<boolean>) {
  }

  async adopt(entity: Target) {
    if (entity.registeredTimes > 1) {
      return;
    }
    if (!this.isGameStarted.getValue()) {
      return;
    }

    entity.setBlink(this.blink(entity.display));
  }

  abandon() {
  }

  private blink(display: PIXI.DisplayObject) {
    return this.game.add.tween(display)
        .to(
            {alpha: 0}, TweenBlinkingSystem.BLINK_DURATION / 2,
            Phaser.Easing.Linear.None,
            true,
            0,
            1,
            true);
  }
}

export default TweenBlinkingSystem;
