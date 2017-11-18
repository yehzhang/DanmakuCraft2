/**
 * An object that is displayable.
 */
export interface Existent {
  /**
   * Returns the object's display.
   */
  display(): PIXI.DisplayObject;
}

/**
 * An object that updates over time.
 */
export interface Animated {
  /**
   * Updates this object.
   */
  tick(): void;
}

/**
 * An object that is displayable and updates over time.
 */
export interface Phenomenal extends Existent, Animated {
}

/**
 * An object that has two states.
 * When at the displayable state, the object is displayable.
 * When at the non-displayable state, the object is non-displayable.
 *
 * This is an optimization that frees up resources taken by this object when appropriate.
 * Otherwise, the object could have only {@link measure}.
 */
export interface Superposed {
  /**
   * Transitions to the displayable state. Generates a display.
   */
  decohere(parentCoordinate: Phaser.Point): void;

  /**
   * Transitions to the non-displayable state. Discards the display.
   */
  cohere(): void;

  /**
   * Returns the object's display if available.
   */
  measure(): PIXI.DisplayObject;
}
