import MessageProvider from './MessageProvider';
import Notifier, {NotificationPriority} from './Notifier';

abstract class BaseNotifier implements Notifier {
  sendFrom(provider: MessageProvider, priority?: NotificationPriority) {
    const message = provider.getMessage();
    if (!message) {
      return;
    }

    this.send(message, priority);
  }

  abstract send(message: string, priority?: NotificationPriority): void;
}

export default BaseNotifier;
