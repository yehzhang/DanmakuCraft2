import MessageProvider from './MessageProvider';

/**
 * Creates a message bubble in UI.
 */
interface Notifier {
  sendFrom(provider: MessageProvider, force?: boolean): void;

  send(message: string, force?: boolean): void;
}

export default Notifier;
