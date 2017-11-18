import {Entity, EntityManager, Region} from './entity';
import {Phenomenal} from './law';

/**
 * Displays entities.
 */
export default class EntityProjector implements Phenomenal {
  private displayInfoList: DisplayInfo[];
  private lastObserverCoordinate: Phaser.Point;
  private container: PIXI.DisplayObjectContainer;

  constructor(entityManagers: EntityManager[], private observer: Entity) {
    this.container = new PIXI.DisplayObjectContainer();

    this.displayInfoList = [];
    let observerCoordinate = this.observer.getCoordinate();
    for (let entityManager of entityManagers) {
      let displayInfo = new DisplayInfo(entityManager, observerCoordinate);
      this.displayInfoList.push(displayInfo);

      this.container.addChild(displayInfo.container);
    }

    this.lastObserverCoordinate = observer.getCoordinate();
  }

  tick() {
    let observerCoordinate = this.observer.getCoordinate();
    for (let displayInfo of this.displayInfoList) {
      displayInfo.tick(observerCoordinate, this.lastObserverCoordinate);
    }

    this.lastObserverCoordinate = observerCoordinate;
  }

  display(): PIXI.DisplayObjectContainer {
    return this.container;
  }
}

class DisplayInfo {
  readonly container: PIXI.DisplayObjectContainer;

  constructor(readonly entityManager: EntityManager, initialObserverCoordinate: Phaser.Point) {
    this.container = new PIXI.DisplayObjectContainer();

    entityManager.listRenderableRegions(initialObserverCoordinate)
        .forEach(this.decohereRegion.bind(this, initialObserverCoordinate));
  }

  tick(coordinate: Phaser.Point, lastCoordinate: Phaser.Point) {
    this.entityManager.leftOuterJoinRenderableRegions(lastCoordinate, coordinate)
        .forEach(this.cohereRegion.bind(this));

    this.entityManager.leftOuterJoinRenderableRegions(coordinate, lastCoordinate)
        .forEach(this.decohereRegion.bind(this, coordinate));
  }

  private decohereRegion(observerCoordinate: Phaser.Point, region: Region<Entity>) {
    region.decohere(observerCoordinate);

    let display = region.measure();
    this.container.addChild(display);
  }

  private cohereRegion(region: Region<Entity>) {
    let display = region.measure();
    this.container.removeChild(display);

    region.cohere();
  }
}
