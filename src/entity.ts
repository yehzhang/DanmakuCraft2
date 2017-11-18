/**
 * Stores entities in regions and provides modifiers and accessors.
 */
import {BuffManager} from './buff';

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
 * An object that has a coordinate relative to its parent.
 *
 * @param worldCoordinate may be outside of the world.
 */
abstract class EntityBase {
  // TODO
  public readonly coordinate: Phaser.Point;

  constructor(coordinate: Phaser.Point) {
    this.coordinate = coordinate.clone();
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
  decohere(): void;

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
 * A maybe-displayable object that has a coordinate relative to parent.
 */
export abstract class Entity extends EntityBase implements Superposed {
  abstract decohere(): void;

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
  decohere() {
    if (this.display != null) {
      throw new Error('Region is decoherent');
    }

    let container = new PIXI.DisplayObjectContainer();

    this.forEach(entity => {
      entity.decohere();

      let display = entity.measure();
      container.addChild(display);
    });

    this.display = container;
  }

  cohere() {
    if (this.display == null) {
      throw new Error('Region is coherent');
    }

    this.forEach(entity => entity.decohere());

    this.display.removeChildren(0, this.display.children.length);
    this.display = null;
  }

  measure(): PIXI.DisplayObjectContainer {
    if (this.display == null) {
      throw new Error('Chunk is not renderable');
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
