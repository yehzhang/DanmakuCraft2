import {TypedDispatcher, Typeful} from '../util';

export class SettingsOption<T> implements Typeful<T> {
  private static readonly KEY_PREFIX = 'danmakuCraftSettings';

  private static optionIdCounter = 0;

  public readonly key: string;

  constructor() {
    this.key = SettingsOption.generateOptionKey();
  }

  getType(): string {
    return this.key;
  }

  private static generateOptionKey() {
    return `${this.KEY_PREFIX}${this.optionIdCounter++}`;
  }
}

class SettingsOptions {
  static readonly FONT_FAMILY = new SettingsOption<string>();
  static readonly TUTORIAL_ENABLED = new SettingsOption<boolean>();
}

/**
 * Provides and manages settings, and dispatches a {@link NEW_SETTINGS} event when settings is
 * changed.
 */
export default abstract class SettingsManager extends TypedDispatcher {
  static readonly Options = SettingsOptions;

  abstract getSetting<T>(option: SettingsOption<T>): T;

  abstract setSetting<T>(option: SettingsOption<T>, value: T): void;
}
