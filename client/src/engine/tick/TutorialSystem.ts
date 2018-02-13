import TickSystem from '../../entitySystem/system/tick/TickSystem';
import SettingsManager, {SettingsOption} from '../../environment/interface/SettingsManager';
import {Phaser} from '../../util/alias/phaser';
import Notifier from '../../output/notification/Notifier';
import Texts from '../../render/Texts';
import {TypeState} from 'typestate';
import Input from '../../input/Input';
import PhysicalConstants from '../../PhysicalConstants';

enum TutorialStates {
  START,
  MOVEMENT_KEYS_FIRST,
  MOVEMENT_KEYS_SECOND,
  MOVEMENT_KEYS_FINAL,
  COMMENT_KEYS,
  END,
}

class TutorialSystem implements TickSystem {
  private static SETTINGS_OPTION =
      new SettingsOption<TutorialStates>('tutorial_next_state', TutorialStates.MOVEMENT_KEYS_FIRST);

  private fsm: TypeState.FiniteStateMachine<TutorialStates>;

  constructor(
      private timer: Phaser.Timer,
      private settingsManager: SettingsManager,
      private notifier: Notifier,
      private input: Input,
      private isEnterPressed: boolean = false,
      private areControllerKeysPressed: boolean = false,
      private nextState: TutorialStates | null = null) {
    this.fsm = this.craftFsm();
  }

  start() {
    if (__DEV__) {
      this.nextState = TutorialStates.MOVEMENT_KEYS_FIRST;
      return;
    }
    this.nextState = this.settingsManager.getSetting(TutorialSystem.SETTINGS_OPTION);
  }

  tick() {
    if (this.fsm.is(TutorialStates.END)) {
      return;
    }

    if (this.input.isEnterActive()) {
      this.isEnterPressed = true;
    }
    if (this.input.isUpActive()
        || this.input.isDownActive()
        || this.input.isLeftActive()
        || this.input.isRightActive()) {
      this.areControllerKeysPressed = true;
    }

    if (this.nextState != null) {
      const nextState = this.nextState;
      this.nextState = null;

      this.fsm.go(nextState);
    }
  }

  private craftFsm() {
    const fsm = new TypeState.FiniteStateMachine(TutorialStates.START);

    fsm.from(TutorialStates.START).toAny(TutorialStates);
    fsm.from(TutorialStates.MOVEMENT_KEYS_FIRST)
        .to(TutorialStates.MOVEMENT_KEYS_SECOND, TutorialStates.COMMENT_KEYS);
    fsm.from(TutorialStates.MOVEMENT_KEYS_SECOND)
        .to(TutorialStates.MOVEMENT_KEYS_FINAL, TutorialStates.COMMENT_KEYS);
    fsm.from(TutorialStates.MOVEMENT_KEYS_FINAL).to(TutorialStates.COMMENT_KEYS);
    fsm.from(TutorialStates.COMMENT_KEYS).to(TutorialStates.END);

    fsm.on(TutorialStates.MOVEMENT_KEYS_FIRST, async () => {
      await this.sleep(8 * Phaser.Timer.SECOND);
      if (this.areControllerKeysPressed) {
        this.nextState = TutorialStates.COMMENT_KEYS;
      } else {
        this.notifier.send(Texts.forName('main.tutorial.movement.first'));
        this.nextState = TutorialStates.MOVEMENT_KEYS_SECOND;
      }
    });

    fsm.on(TutorialStates.MOVEMENT_KEYS_SECOND, async () => {
      await this.sleep(PhysicalConstants.NOTIFIER_BUBBLE_DISPLAY_DURATION + Phaser.Timer.SECOND);
      if (this.areControllerKeysPressed) {
        this.nextState = TutorialStates.COMMENT_KEYS;
      } else {
        this.notifier.send(Texts.forName('main.tutorial.movement.second'));
        this.nextState = TutorialStates.MOVEMENT_KEYS_FINAL;
      }
    });

    fsm.on(TutorialStates.MOVEMENT_KEYS_FINAL, async () => {
      this.settingsManager.setSetting(
          TutorialSystem.SETTINGS_OPTION, TutorialStates.MOVEMENT_KEYS_FINAL);

      await this.sleep(PhysicalConstants.NOTIFIER_BUBBLE_DISPLAY_DURATION + 5 * Phaser.Timer.SECOND);
      if (!this.areControllerKeysPressed) {
        this.notifier.send(Texts.forName('main.tutorial.movement.final'));
      }

      this.nextState = TutorialStates.COMMENT_KEYS;
    });

    fsm.on(TutorialStates.COMMENT_KEYS, async () => {
      this.settingsManager.setSetting(TutorialSystem.SETTINGS_OPTION, TutorialStates.COMMENT_KEYS);

      await this.sleep(__DEV__
          ? PhysicalConstants.NOTIFIER_BUBBLE_DISPLAY_DURATION + Phaser.Timer.SECOND
          : 5 * Phaser.Timer.MINUTE);
      if (!this.isEnterPressed) {
        this.notifier.send(Texts.forName('main.tutorial.comment'));
      }

      this.nextState = TutorialStates.END;
    });

    fsm.on(
        TutorialStates.END,
        () => this.settingsManager.setSetting(TutorialSystem.SETTINGS_OPTION, TutorialStates.END));

    return fsm;
  }

  private async sleep(duration: number) {
    return new Promise(resolve => this.timer.add(duration, resolve));
  }
}

export default TutorialSystem;
