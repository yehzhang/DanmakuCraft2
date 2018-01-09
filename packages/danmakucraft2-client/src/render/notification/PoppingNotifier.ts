import BaseNotifier from './BaseNotifier';
import {NotifierView} from '../graphics/GraphicsFactory';
import ConditionalVariable from '../../util/async/ConditionalVariable';
import {NotificationPriority} from './Notifier';
import Phaser = require('phaser-ce-type-updated/build/custom/phaser-split');

class PoppingNotifier extends BaseNotifier {
  private static readonly BUBBLE_DISPLAY_DURATION = 5 * Phaser.Timer.SECOND;
  private static readonly SPEECH_BOX_POP_HEIGHT = 10;

  constructor(
      private game: Phaser.Game,
      private view: NotifierView,
      private messageCondition: ConditionalVariable = new ConditionalVariable(),
      private skipPauseCondition: ConditionalVariable = new ConditionalVariable(),
      private notificationQueue: Notification[] = []) {
    super();
    let ignored = this.createMessageListener();
  }

  send(message: string, priority: NotificationPriority = NotificationPriority.NORMAL) {
    let notification = new Notification(message, priority);
    if (priority === NotificationPriority.OVERRIDE) {
      if (this.notificationQueue.length > 0
          && this.notificationQueue[0].priority === NotificationPriority.OVERRIDE) {
        this.notificationQueue[0] = notification;
      } else {
        this.notificationQueue.unshift(notification);
      }
      this.skipPauseCondition.notifyAll();
    } else if (priority === NotificationPriority.SKIP) {
      this.notificationQueue.unshift(notification);
      this.skipPauseCondition.notifyAll();
    } else {
      this.notificationQueue.push(notification);
    }
    this.messageCondition.notifyAll();
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
      while (this.notificationQueue.length > 0) {
        let notification = this.notificationQueue.shift() as Notification;
        await this.showBubble(notification.message);
        await this.pause();
        await this.hideBubble();
      }
      await this.messageCondition.wait();
    }
  }

  private async pause(duration: number = PoppingNotifier.BUBBLE_DISPLAY_DURATION) {
    let sleepEvent = this.game.time.events.add(duration, () => {
      this.skipPauseCondition.notifyAll();
    });

    await this.skipPauseCondition.wait();

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

class Notification {
  constructor(readonly message: string, readonly priority: NotificationPriority) {
  }
}
