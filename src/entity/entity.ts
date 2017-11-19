import {BuffManager} from '../buff';
import {PhysicalConstants} from '../Universe';
import {Animated, Container, Superposed} from '../law';

/**
 * Stores entities in regions and provides modifiers and accessors.
 */
export interface EntityManager<E extends Entity = Entity> extends Container<Region<E>> {
  /**
   * Loads many entities.
   */
  loadBatch(entities: E[]): void;

  /**
   * Loads a single entity.
   */
  load(entity: E): void;

  /**
   * Returns all regions displayable around the world coordinate.
   * If the coordinate is close to the edge of the world, expects to return displayable regions on
   * the other side of the world as well.
   */
  listRenderableRegions(worldCoordinate: Phaser.Point): Array<Region<E>>;

  leftOuterJoinRenderableRegions(
      worldCoordinate: Phaser.Point, otherCoordinate: Phaser.Point): Array<Region<E>>;

  /**
   * @param {(chunks: Array<Region<E extends Entity>>) => void} f scans every aggregation of
   *     regions.
   * @param {number} radius the radius of each aggregation in world coordinate passed to
   *     {@param f}. The actual radius of each aggregation can be approximate.
   */
  scan(f: (regions: Array<Region<E>>) => void, radius: number): void;

  /**
   * @param {Phaser.Point} worldCoordinate the center of an aggregation containing regions.
   * @param {number} radius the radius of the aggregation. The actual radius of the aggregation
   *     returned can be approximate. If zero, returns an empty array.
   * @return {Array<Region<E extends Entity>>} the aggregation.
   */
  listNeighborsAround(worldCoordinate: Phaser.Point, radius: number): Array<Region<E>>;

  /**
   * Checks if the two world coordinates are in a same managed region.
   */
  isInSameRegion(worldCoordinate: Phaser.Point, otherCoordinate: Phaser.Point): boolean;
}

/**
 * An object that has a world coordinate.
 *
 * @param worldCoordinate may be outside of the world.
 */
abstract class EntityBase {
  protected readonly worldCoordinate: Phaser.Point;

  constructor(worldCoordinate: Phaser.Point) {
    this.worldCoordinate = worldCoordinate.clone();
  }

  getCoordinate() {
    return this.worldCoordinate.clone();
  }

  protected getWorldWrappingOffsetRelativeTo(coordinate: Phaser.Point): Phaser.Point {
    let offsetX = EntityBase.getWorldWrappingOffset(this.worldCoordinate.x, coordinate.x);
    let offsetY = EntityBase.getWorldWrappingOffset(this.worldCoordinate.y, coordinate.y);
    return new Phaser.Point(offsetX, offsetY);
  }

  // TODO test
  private static getWorldWrappingOffset(coordinate: number, other: number): number {
    let offset = coordinate - other;

    let wrappingOffset;
    if (coordinate < other) {
      wrappingOffset = offset + PhysicalConstants.WORLD_SIZE;
    } else {
      wrappingOffset = offset - PhysicalConstants.WORLD_SIZE;
    }

    if (Math.abs(offset) <= Math.abs(wrappingOffset)) {
      return offset;
    } else {
      return wrappingOffset;
    }
  }
}

/**
 * A maybe-displayable object that has a world coordinate.
 */
export abstract class Entity extends EntityBase implements Superposed {
  abstract decohere(parentCoordinate: Phaser.Point): void;

  abstract cohere(): void;

  abstract measure(): PIXI.DisplayObject;
}

/**
 * Contains entities.
 */
export abstract class Region<E extends Entity> extends Entity implements Container<E> {
  private display: PIXI.DisplayObjectContainer | null;

  constructor(coordinate: Phaser.Point) {
    super(coordinate);
    this.display = null;
  }

  abstract addEntity(entity: E): void;

  abstract countEntities(): number;

  abstract forEach(f: (value: E, index: number) => void, thisArg?: any): void;

  /**
   * In addition to generating a display, also attaches to it all children's displays.
   */
  decohere(parentCoordinate: Phaser.Point): void {
    if (this.display != null) {
      throw new Error('Region is decoherent');
    }

    let container = new PIXI.DisplayObjectContainer();
    container.position = this.getWorldWrappingOffsetRelativeTo(parentCoordinate);

    this.forEach(entity => {
      entity.decohere(this.worldCoordinate);

      let display = entity.measure();
      container.addChild(display);
    });

    this.display = container;
  }

  cohere() {
    if (this.display == null) {
      throw new Error('Region is coherent');
    }

    this.display.removeChildren(0, this.display.children.length);
    this.display = null;

    this.forEach(entity => entity.cohere());
  }

  measure(): PIXI.DisplayObjectContainer {
    if (this.display == null) {
      throw new Error('Chunk is not displayable');
    }

    return this.display;
  }
}

export abstract class AnimatedEntity extends Entity implements Animated {
  protected buffManager: BuffManager<this>;

  constructor(coordinate: Phaser.Point) {
    super(coordinate);

    this.buffManager = new BuffManager(this);
  }

  tick() {
    this.buffManager.tick();
  }
}
