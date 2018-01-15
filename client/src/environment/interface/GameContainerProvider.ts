/**
 * Returns an element that will become the container of the game.
 */
interface GameContainerProvider {
  getContainerId(): string;
}

export default GameContainerProvider;
