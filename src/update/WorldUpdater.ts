import EntityTracker from './EntityTracker';

class WorldUpdater {
  constructor(private foregroundTracker: EntityTracker, private backgroundTracker: EntityTracker) {
  }

  tick(): void {
    this.foregroundTracker.tick();
    this.backgroundTracker.tick();
  }

  updateRenderRadius(radius: number) {
    this.foregroundTracker.updateSamplingRadius(radius);
  }

}

export default WorldUpdater;
