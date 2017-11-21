import {BuffManager} from '../buff';
import {
  Animated,
  Existent,
  Superposed,
  toWorldCoordinate2d,
  toWorldCoordinateOffset2d
} from '../law';
import {PhysicalConstants} from '../Universe';

/**
 * An object that has a world coordinate.
 *
 * A concrete entity should implement either {@link Existent} or {@link Superposed}.
 */
export abstract class Entity {
  protected readonly worldCoordinate: Phaser.Point;

  /**
   * @param coordinate an arbitrary coordinate that may be outside of the world.
   */
  constructor(coordinate: Phaser.Point) {
    this.worldCoordinate = toWorldCoordinate2d(coordinate, PhysicalConstants.WORLD_SIZE);
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
 * An entity that has a {@link BuffManager}.
 */
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

/**
 * A {@link Superposed} entity.
 * Usually it is a non-significant object.
 */
export abstract class SuperposedEntity extends Entity implements Superposed {
  abstract decohere(parentCoordinate: Phaser.Point): void;

  abstract cohere(): void;

  abstract measure(): PIXI.DisplayObject;
}

/**
 * A {@link Superposed} entity that updates when it is decoherent.
 * Technically a {@link SuperposedEntity}.
 */
export abstract class NonPlayerCharacter extends AnimatedEntity implements Superposed {
  private decoherent: boolean;

  constructor(coordinate: Phaser.Point) {
    super(coordinate);
    this.decoherent = false;
  }

  decohere(parentCoordinate: Phaser.Point): void {
    this.decoherent = true;
  }

  cohere(): void {
    this.decoherent = false;
  }

  abstract measure(): PIXI.DisplayObject;

  tick() {
    if (!this.decoherent) {
      return;
    }
    super.tick();
  }
}

/**
 * A {@link Existent} entity. Since it observes, it is always decoherent, and thus there is no need
 * to implement {@link Superposed}.
 * Usually it is a significant object.
 */
export abstract class Observer extends Entity implements Existent {
  abstract display(): PIXI.DisplayObject;
}

/**
 * An {@link Existent} entity that updates over time.
 * Technically a {@link Observer}.
 */
export abstract class Player extends AnimatedEntity implements Existent {
  abstract display(): PIXI.Graphics;
}
