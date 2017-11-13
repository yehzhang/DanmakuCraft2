export interface MessageProvider {
  getMessage(): string;
}

/**
 * Creates a message bubble in UI.
 */
export class Notifier {
  notify(provider: MessageProvider) {
    let message = provider.getMessage();
    if (!message) {
      return;
    }

    // TODO
    throw new Error('Not implemented');
  }
}
