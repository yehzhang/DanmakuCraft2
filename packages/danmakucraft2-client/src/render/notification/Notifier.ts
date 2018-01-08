import MessageProvider from './MessageProvider';

/**
 * Creates a message bubble in UI.
 */
interface Notifier {
  sendFrom(provider: MessageProvider, priority?: NotificationPriority): void;

  send(message: string, priority?: NotificationPriority): void;
}

export default Notifier;

export enum NotificationPriority {
  NORMAL,
  SKIP,
  OVERRIDE,
}
