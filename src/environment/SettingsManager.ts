import EventDispatcher from '../event/EventDispatcher';
import Event, {EventType} from '../event/Event';
import {UuidGenerator} from '../IdGenerator';

export class SettingsOption<T> extends Event<EventType.SETTINGS_CHANGE, T> {
  readonly key: string;

  constructor() {
    super();
    this.key = UuidGenerator.generateUniqueId();
  }
}

class SettingsOptions {
  static readonly FONT_FAMILY = new SettingsOption<string>();
  static readonly TUTORIAL_ENABLED = new SettingsOption<boolean>();
}

/**
 * Provides and manages settings, and dispatches a {@link EventType.SETTINGS_CHANGE} event when
 * settings is changed.
 */
export default abstract class SettingsManager extends EventDispatcher<EventType.SETTINGS_CHANGE> {
  static readonly Options = SettingsOptions;

  abstract getSetting<T>(option: SettingsOption<T>): T;

  abstract setSetting<T>(option: SettingsOption<T>, value: T): void;
}
