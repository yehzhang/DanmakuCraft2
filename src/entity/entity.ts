import {BuffManager} from '../buff';
import {Animated, Superposed, toWorldCoordinateOffset2d} from '../law';
import {PhysicalConstants} from '../Universe';

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
