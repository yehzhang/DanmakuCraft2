import MessageProvider from './MessageProvider';

/**
 * Creates a message bubble in UI.
 */
class Notifier {
  notifyFrom(provider: MessageProvider) {
    let message = provider.getMessage();
    if (!message) {
      return;
    }

    this.notify(message);
  }

  notify(message: string) {
    // TODO
    throw new Error('Not implemented');
  }
}

export default Notifier;
