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
  private typeConstraint(): T {
    throw new Error('This method is for exploiting the type system, not for calling');
  }

  private valueConstraint(): V {
    throw new Error('This method is for exploiting the type system, not for calling');
  }
}
