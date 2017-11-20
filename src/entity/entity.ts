import {BuffManager} from '../buff';
import {Animated, Container, Superposed, toWorldCoordinateOffset2d} from '../law';
import {PhysicalConstants} from '../Universe';

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
   * Checks if the two world coordinates are in a same managed region.
   */
  isInSameRegion(worldCoordinate: Phaser.Point, otherCoordinate: Phaser.Point): boolean;

  /**
   * Returns an array of regions around {@param worldCoordinate} within {@param radius}.
   * The distance between a region returned and {@param worldCoordinate} could be larger than
   * {@param radius}.
   *
   * Note that the world is bicylinder, which means the aggregation of regions around a coordinate
   * within a certain radius looks like a rectangle, not a circle.
   */
  listAround(worldCoordinate: Phaser.Point, radius: number): Array<Region<E>>;
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
    return toWorldCoordinateOffset2d(
        this.worldCoordinate, coordinate, PhysicalConstants.WORLD_SIZE);
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
export abstract class Region<E extends Entity = Entity> extends Entity implements Container<E> {
  private static idCounter = 0;

  private display: PIXI.DisplayObjectContainer | null;
  public readonly id: string;

  constructor(coordinate: Phaser.Point) {
    super(coordinate);

    this.id = Region.generateUniqueId().toString();
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

  private static generateUniqueId(): number {
    return this.idCounter++;
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
