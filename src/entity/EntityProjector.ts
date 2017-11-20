import {AnimatedEntity} from './entity';
import {Existent} from '../law';
import EntityTracker, {RegionChangeEventDigester} from './EntityTracker';
import Universe from '../Universe';
import {EntityManager, Region} from './EntityManager';

/**
 * Displays entities.
 */
export default class EntityProjector<E extends AnimatedEntity>
    extends RegionChangeEventDigester<E, PIXI.DisplayObjectContainer>
    implements Existent {
  private container: PIXI.DisplayObjectContainer;

  constructor(entityTracker: EntityTracker<E>) {
    let game = Universe.getGame();
    let samplingRadius = EntityProjector.getSamplingRadius(game.width, game.height);
    super(entityTracker, samplingRadius);

    this.container = new PIXI.DisplayObjectContainer();

    game.scale.onSizeChange.add(this.onGameResize, this);
  }

  private onGameResize(width: number, height: number) {
    let samplingRadius = EntityProjector.getSamplingRadius(width, height);
    this.updateSamplingRadius(samplingRadius);
  }

  private static getSamplingRadius(width: number, height: number): number {
    let longerSide = Math.max(width, height);
    let radius = 0; // TODO calculate actual size;
    throw new Error('Not implemented');
    // return radius;
  }

  protected makeContext(entityManager: EntityManager, trackee: E, regions: Region[]) {
    let container = new PIXI.DisplayObjectContainer();
    this.container.addChild(container);
    return container;
  }

  protected onEnter(
      entityManager: EntityManager,
      trackee: E,
      regions: Region[],
      container: PIXI.DisplayObjectContainer): void {
    let observerCoordinate = trackee.getCoordinate();
    for (let region of regions) {
      region.decohere(observerCoordinate);

      let display = region.measure();
      container.addChild(display);
    }
  }

  protected onExit(
      entityManager: EntityManager,
      trackee: E,
      regions: Region[],
      container: PIXI.DisplayObjectContainer): void {
    for (let region of regions) {
      let display = region.measure();
      container.removeChild(display);

      region.cohere();
    }
  }

  display(): PIXI.DisplayObjectContainer {
    return this.container;
  }
}
