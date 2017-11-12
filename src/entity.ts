/**
 * Stores entities in regions and provides modifiers and accessors.
 */
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
  constructor(private position: Phaser.Point) {
  }

  getPosition() {
    return this.position;
  }
}

export class PlayerEntity extends Entity {
  // TODO
}
