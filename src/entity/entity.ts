import {BuffManager} from '../buff/BuffManager';
import {
  Animated,
  Existent,
  Superposed,
  toWorldCoordinate2d,
  toWorldCoordinateOffset2d
} from '../law';
import PhysicalConstants from '../PhysicalConstants';

/**
 * An object that has a world coordinate.
 *
 * A concrete entity should implement either {@link Existent} or {@link Superposed}.
 */
export abstract class Entity {
  protected worldCoordinate: Phaser.Point;

  /**
   * @param coordinate an arbitrary coordinate that may be outside of the world.
   */
  constructor(coordinate: Phaser.Point) {
    this.worldCoordinate = toWorldCoordinate2d(coordinate, PhysicalConstants.WORLD_SIZE);
  }

  getCoordinate() {
    return this.worldCoordinate.clone();
  }

  /**
   * Returns this entity's position relative to {@param position} as if it is a coordinate.
   */
  protected getPositionBy(position: Phaser.Point): Phaser.Point {
    return toWorldCoordinateOffset2d(this.worldCoordinate, position, PhysicalConstants.WORLD_SIZE);
  }
}

/**
 * An entity that has a {@link BuffManager}.
 */
export abstract class AnimatedEntity extends Entity implements Animated {
  readonly buffManager: BuffManager<this>;

  constructor(coordinate: Phaser.Point) {
    super(coordinate);

    this.buffManager = new BuffManager(this);
  }

  tick() {
    this.buffManager.tick();
  }

  moveBy(offsetX: number, offsetY: number) {
    this.worldCoordinate = toWorldCoordinate2d(
        this.worldCoordinate.add(offsetX, offsetY), PhysicalConstants.WORLD_SIZE);
  }
}

/**
 * A {@link Superposed} entity.
 * Usually it is a non-significant object.
 */
export abstract class SuperposedEntity extends Entity implements Superposed {
  /**
   * Decoheres this entity relative to {@param parentPosition}, i.e., the position of display
   * returned by {@link measure} should be the offset between {@link worldCoordinate} and
   * {@param parentPosition}.
   */
  abstract decohere(parentPosition: Phaser.Point): void;

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

  abstract decohere(parentPosition: Phaser.Point): void;

  abstract cohere(): void;

  abstract measure(): PIXI.DisplayObject;

  tick() {
    if (!this.decoherent) {
      return;
    }

    super.tick();
    this.tickOnDecoherent();
  }

  abstract tickOnDecoherent(): void;

  moveBy(offsetX: number, offsetY: number) {
    super.moveBy(offsetX, offsetY);

    if (!this.decoherent) {
      return;
    }

    let displayPosition = this.measure().position;
    displayPosition.x += offsetX;
    displayPosition.y += offsetY;
  }
}

/**
 * A {@link Existent} entity. Since it observes, it is always decoherent, and thus there is no need
 * to implement {@link Superposed}.
 * Usually it is a significant object.
 */
export abstract class Observer extends Entity implements Existent {
  abstract display(): Phaser.Sprite;
}

/**
 * An {@link Existent} entity that updates over time.
 * Technically a {@link Observer}.
 */
export abstract class Player extends AnimatedEntity implements Existent {
  constructor(coordinate: Phaser.Point, protected sprite: Phaser.Sprite) {
    super(coordinate);
    this.sprite.position = this.getCoordinate();
    // TODO find a way to update sprite position when camera is following other players
  }

  display(): Phaser.Sprite {
    return this.sprite;
  }

  moveBy(offsetX: number, offsetY: number) {
    super.moveBy(offsetX, offsetY);
    this.sprite.position.add(offsetX, offsetY);
  }
}
