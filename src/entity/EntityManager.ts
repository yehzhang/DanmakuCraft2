import {Container} from '../law';
import {SuperposedEntity} from './entity';

/**
 * Stores {@link SuperposedEntity}s in {@link Region}s and supports for querying entities within a
 * certain area.
 *
 * If an entity is not {@link Superposed}, there is no need for a {@link EntityManager}, because
 * the entity has to be displayed globally anyway.
 */
export default interface EntityManager<E extends SuperposedEntity = SuperposedEntity>
    extends Container<Region<E>> {
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
 * Contains {@link SuperposedEntity}s.
 */
export abstract class Region<E extends SuperposedEntity = SuperposedEntity>
    extends SuperposedEntity
    implements Container<E> {
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