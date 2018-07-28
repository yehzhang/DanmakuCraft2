import PhysicalConstants from '../../PhysicalConstants';
import {NotifierView} from '../../render/graphics/GraphicsFactory';
import {Phaser} from '../../util/alias/phaser';
import ConditionalVariable from '../../util/async/ConditionalVariable';
import BaseNotifier from './BaseNotifier';
import {NotificationPriority} from './Notifier';

class PoppingNotifier extends BaseNotifier {
  private static readonly SPEECH_BOX_POP_HEIGHT = 10;

  constructor(
      private game: Phaser.Game,
      private view: NotifierView,
      private messageCondition: ConditionalVariable = new ConditionalVariable(),
      private skipPauseCondition: ConditionalVariable = new ConditionalVariable(),
      private notificationQueue: Notification[] = []) {
    super();
    const ignored = this.createMessageListener();
  }

  send(message: string, priority: NotificationPriority = NotificationPriority.NORMAL) {
    const notification = new Notification(message, priority);
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
    const tweenBubble = this.game.add.tween(this.view.speechBox).to(
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
    const tweenBubble = this.game.add.tween(this.view.speechBox).to(
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
        const notification = this.notificationQueue.shift() as Notification;
        await this.showBubble(notification.message);
        await this.pause();
        await this.hideBubble();
      }
      await this.messageCondition.wait();
    }
  }

  private async pause(duration: number = PhysicalConstants.NOTIFIER_BUBBLE_DISPLAY_DURATION) {
    const sleepEvent = this.game.time.events.add(duration, () => {
      this.skipPauseCondition.notifyAll();
    });

    await this.skipPauseCondition.wait();

    this.game.time.events.remove(sleepEvent);
  }

  private characterWrap(message: string): string {
    const wrappedCharacters = [];

    let testingText = '';
    const text = this.game.make.text(0, 0, testingText);
    for (const character of message) {
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
