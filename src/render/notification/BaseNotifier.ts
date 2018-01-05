import Notifier from './Notifier';
import MessageProvider from './MessageProvider';

abstract class BaseNotifier implements Notifier {
  sendFrom(provider: MessageProvider, force?: boolean) {
    let message = provider.getMessage();
    if (!message) {
      return;
    }

    this.send(message);
  }

  abstract send(message: string, force?: boolean): void;
}

export default BaseNotifier;
