import Notifier, {NotificationPriority} from './Notifier';
import MessageProvider from './MessageProvider';

abstract class BaseNotifier implements Notifier {
  sendFrom(provider: MessageProvider, priority?: NotificationPriority) {
    let message = provider.getMessage();
    if (!message) {
      return;
    }

    this.send(message, priority);
  }

  abstract send(message: string, priority?: NotificationPriority): void;
}

export default BaseNotifier;
