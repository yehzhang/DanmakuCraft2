/**
 * An object that updates over time.
 */
interface Animated {
  /**
   * Updates this object.
   */
  tick(): void;
}

export default Animated;
