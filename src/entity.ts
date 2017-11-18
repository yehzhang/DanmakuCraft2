import {BuffManager} from './buff';
import {PhysicalConstants} from './Universe';

/**
 * Stores entities in regions and provides modifiers and accessors.
 */
export interface EntityManager<E extends Entity = Entity> {
  loadBatch(entities: E[]): void;

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
   * Iterates over all managed entities.
   */
  forEach(f: (entity: E) => void): void;
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
 * An object that has two states.
 * When at the displayable state, the object is displayable.
 * When at the non-displayable state, the object is non-displayable.
 *
 * This is an optimization that frees up resources taken by this object when appropriate.
 * Otherwise, the object could have only {@link measure}.
 */
interface Superposed {
  /**
   * Transitions to the displayable state. Generates a display.
   */
  decohere(parentCoordinate: Phaser.Point): void;

  /**
   * Transitions to the non-displayable state. Discards the display.
   */
  cohere(): void;

  /**
   * Returns the object's display.
   */
  measure(): PIXI.DisplayObject;
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
export abstract class Region<E extends Entity> extends Entity {
  private display: PIXI.DisplayObjectContainer | null;

  constructor(coordinate: Phaser.Point) {
    super(coordinate);
    this.display = null;
  }

  abstract addEntity(entity: E): void;

  abstract countEntities(): number;

  abstract forEach(f: (entity: E) => void): void;

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

    this.forEach(entity => entity.cohere());

    this.display.removeChildren(0, this.display.children.length);
    this.display = null;
  }

  measure(): PIXI.DisplayObjectContainer {
    if (this.display == null) {
      throw new Error('Chunk is not displayable');
    }

    return this.display;
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
  decohere(): void {
    throw new Error('Method not implemented. Currently player is always displayed.');
  }

  cohere(): void {
    throw new Error('Method not implemented. Currently player is always displayed.');
  }

  measure(): PIXI.DisplayObject {
    throw new Error('Method not implemented.');  // TODO
  }
}
