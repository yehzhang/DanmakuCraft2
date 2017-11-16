export interface MessageProvider {
  getMessage(): string;
}

/**
 * Creates a message bubble in UI.
 */
export class Notifier {
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

export class Messages {

}
