import {throwNominalTypePlaceholderError} from '../nominalType';

export enum EventType {
  NONE,
  SETTINGS_CHANGE,
  COMMENT_NEW,
}

/**
 * @template T type of this event.
 * @template V type of value that is dispatched along with this event.
 */
export default class Event<T extends EventType, V> {
  private __T__(): T {
    return throwNominalTypePlaceholderError();
  }

  private __V__(): V {
    return throwNominalTypePlaceholderError();
  }
}
