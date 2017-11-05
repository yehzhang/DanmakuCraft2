export interface GameContainerProvider {
  getContainer(): HTMLElement;
}

export interface EnvironmentAdapter {
  getGameContainerProvider(): GameContainerProvider;
}
