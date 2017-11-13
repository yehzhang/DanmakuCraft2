/**
 * Stores entities in regions and provides modifiers and accessors.
 */
import {BuffManager} from './buff';

export interface EntityManager<E extends Entity = Entity> {
  loadBatch(entities: E[]): void;

  load(entity: E): void;

  /**
   * Returns all regions renderable around the world coordinate.
   * If the coordinate is close to the edge of the world, expects to return renderable regions on
   * the other side of the world as well.
   */
  listRenderableRegions(worldCoordinate: Phaser.Point): Array<Region<E>>;

  leftOuterJoinRenderableRegions(
      worldCoordinate: Phaser.Point, otherCoordinate: Phaser.Point): Array<Region<E>>;
}

/**
 * Stores entities.
 */
export interface Region<E extends Entity> {
  addEntity(entity: E): void;

  countEntities(): number;

  forEach(f: (entity: E) => void): void;
}

export abstract class Entity {
  // TODO
  constructor(protected coordinate: Phaser.Point) {
  }

  /**
   * Returns coordinate of the entity. It might be outside of the world.
   */
  getCoordinate() {
    return this.coordinate;
  }
}

export abstract class AnimatedEntity extends Entity {
  protected buffManager: BuffManager<this>;

  constructor(coordinate: Phaser.Point) {
    super(coordinate);

    this.buffManager = new BuffManager(this);
  }

  tick() {
    this.buffManager.tick();
  }
}

export class PlayerEntity extends AnimatedEntity {
  // TODO
}
