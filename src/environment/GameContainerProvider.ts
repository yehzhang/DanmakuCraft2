/**
 * Returns an element that will become the container of the game.
 */
export default interface GameContainerProvider {
  getContainerId(): string;
}
