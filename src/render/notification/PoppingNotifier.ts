import BaseNotifier from './BaseNotifier';
import {NotifierView} from '../graphics/GraphicsFactory';
import Phaser = require('phaser-ce-type-updated/build/custom/phaser-split');

class PoppingNotifier extends BaseNotifier {
  private static readonly BUBBLE_DISPLAY_DURATION = 5 * Phaser.Timer.SECOND;
  private static readonly SPEECH_BOX_POP_HEIGHT = 10;
  private messageListener: Promise<void>;

  constructor(
      private game: Phaser.Game,
      private view: NotifierView,
      private messageCondition: ConditionalVariable = new ConditionalVariable(),
      private sleepCondition: ConditionalVariable = new ConditionalVariable(),
      private messageQueue: string[] = []) {
    super();
    this.messageListener = this.createMessageListener();
  }

  send(message: string, force?: boolean) {
    if (force) {
      this.messageQueue.unshift(message);
      this.sleepCondition.notify();
    } else {
      this.messageQueue.push(message);
    }
    this.messageCondition.notify();
  }

  private async hideBubble() {
    let tweenBubble = this.game.add.tween(this.view.speechBox).to(
        {y: this.view.speechBox.y + PoppingNotifier.SPEECH_BOX_POP_HEIGHT},
        70,
        Phaser.Easing.Quadratic.In,
        true);
    return new Promise(resolve => {
      tweenBubble.onComplete.addOnce(() => {
        this.view.speechBox.visible = false;
        this.view.speechBox.y -= PoppingNotifier.SPEECH_BOX_POP_HEIGHT;

        resolve();
      });
    });
  }

  private async showBubble(message: string) {
    this.view.textField.text = this.characterWrap(message);

    this.view.speechBox.visible = true;
    let tweenBubble = this.game.add.tween(this.view.speechBox).to(
        {y: this.view.speechBox.y - PoppingNotifier.SPEECH_BOX_POP_HEIGHT},
        70,
        Phaser.Easing.Quadratic.Out,
        true,
        0,
        0,
        true);

    return new Promise(resolve => {
      tweenBubble.onComplete.addOnce(resolve);
    });
  }

  private async createMessageListener() {
    // noinspection InfiniteLoopJS
    while (true) {
      while (this.messageQueue.length > 0) {
        let message = this.messageQueue.shift() as string;
        await this.showBubble(message);
        await this.sleepBubble();
        await this.hideBubble();
      }
      await this.messageCondition.wait();
    }
  }

  private async sleepBubble(duration: number = PoppingNotifier.BUBBLE_DISPLAY_DURATION) {
    let sleepEvent = this.game.time.events.add(duration, () => {
      this.sleepCondition.notify();
    });

    await this.sleepCondition.wait();

    this.game.time.events.remove(sleepEvent);
  }

  private characterWrap(message: string): string {
    let wrappedCharacters = [];

    let testingText = '';
    let text = this.game.make.text(0, 0, testingText);
    for (let character of message) {
      if (/\s/.test(character)) {
        testingText = '';
      } else {
        testingText += character;
        text.text = testingText;
        if (text.width > this.view.textBoundsWidth) {
          wrappedCharacters.push(' ');
          testingText = '';
        }
      }
      wrappedCharacters.push(character);
    }

    return wrappedCharacters.join('');
  }
}

export default PoppingNotifier;

class ConditionalVariable {
  constructor(public notify: () => void = () => {
  }) {
  }

  async wait() {
    return new Promise(resolve => {
      this.notify = resolve;
    });
  }
}
