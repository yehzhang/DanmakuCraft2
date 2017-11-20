import {AnimatedEntity, EntityManager, Region} from './entity';
import {EventDispatcher, UnaryEvent} from '../dispatcher';
import {Animated, Container} from '../law';
import {PhysicalConstants} from '../Universe';

export class RegionChangeEvent<E extends AnimatedEntity> extends UnaryEvent<RegionChangeData<E>> {
  static readonly type = 'regionChange';

  constructor(regionChangeData: RegionChangeData<E>) {
    super(RegionChangeEvent.type, regionChangeData);
  }
}

export class RegionChangeData<E extends AnimatedEntity> {
  constructor(
      readonly trackee: E,
      readonly previousCoordinate: Phaser.Point,
      readonly entityManager: EntityManager,
      readonly entityManagerIndex: number) {
  }
}

/**
 * Tracks an entity and dispatches an {@link RegionChangeEvent} whenever the entity moves from one
 * region to another.
 */
export default class EntityTracker<E extends AnimatedEntity>
    extends EventDispatcher<RegionChangeEvent<E>> implements Animated, Container<EntityManager> {
  static readonly REGION_CHANGE = RegionChangeEvent.type;

  private entityManagers: EntityManager[];
  private previousCoordinate: Phaser.Point;

  constructor(private trackee: E, entityManagers: EntityManager[]) {
    super();

    this.entityManagers = entityManagers.slice();
    this.previousCoordinate = trackee.getCoordinate();
  }

  getTrackee(): E {
    return this.trackee;
  }

  getPreviousCoordinate() {
    return this.previousCoordinate.clone();
  }

  forEach(f: (value: EntityManager, index: number) => void, thisArg?: any) {
    return this.entityManagers.forEach(f, thisArg);
  }

  tick(): void {
    let coordinate = this.trackee.getCoordinate();
    this.entityManagers.forEach((entityManager, entityManagerIndex) => {
      if (entityManager.isInSameRegion(coordinate, this.previousCoordinate)) {
        return;
      }

      let regionChangeData = new RegionChangeData(
          this.trackee,
          this.previousCoordinate,
          entityManager,
          entityManagerIndex);
      this.dispatchEvent(new RegionChangeEvent(regionChangeData));
    });
  }
}

/**
 * Takes an {@link RegionChangeEvent} and produces some fine-grained result.
 * Calls {@link onEnter} when {@link entityTracker}'s trackee enters some new regions,
 * calls {@link onExit} when {@link entityTracker}'s trackee exits some old regions, and
 * calls {@link onUpdate} when either of the two methods above is called.
 *
 * Does not call those methods if the regions related to trackee are not changed.
 */
export abstract class RegionChangeEventDigester<E extends AnimatedEntity, T> {
  private entityManagerDigestContexts: { [entityManagerIndex: number]: T };

  constructor(private entityTracker: EntityTracker<E>, private samplingRadius: number) {
    RegionChangeEventDigester.validateRadius(samplingRadius);

    this.entityManagerDigestContexts = {};
    let trackee = entityTracker.getTrackee();
    let coordinate = trackee.getCoordinate();
    entityTracker.forEach((entityManager, entityManagerIndex) => {
      if (!this.doesDigest(entityManager, trackee)) {
        return;
      }

      let initialRegions = entityManager.listAround(coordinate, samplingRadius);
      let digestContext = this.makeContext(entityManager, trackee, initialRegions);
      this.entityManagerDigestContexts[entityManagerIndex] = digestContext;

      this.update(entityManager, trackee, initialRegions, [], digestContext);
    });

    entityTracker.addEventListener(EntityTracker.REGION_CHANGE, event => {
      this.digest(event);
    });
  }

  private static validateRadius(radius: number) {
    if (!(radius >= 0 || radius * 2 <= PhysicalConstants.WORLD_SIZE)) {
      throw new Error(`Invalid sampling radius: '${radius}'`);
    }
  }

  updateSamplingRadius(samplingRadius: number) {
    RegionChangeEventDigester.validateRadius(samplingRadius);

    if (samplingRadius === this.samplingRadius) {
      return;
    }

    let trackee = this.entityTracker.getTrackee();
    let previousCoordinate = this.entityTracker.getPreviousCoordinate();
    this.entityTracker.forEach((entityManager, entityManagerIndex) => {
      this.applyIfDigestible(entityManagerIndex, digestContext => {
        let currentRegions = entityManager.listAround(previousCoordinate, this.samplingRadius);
        let newRegions = entityManager.listAround(previousCoordinate, samplingRadius);
        this.update(entityManager, trackee, newRegions, currentRegions, digestContext);
      });
    });

    this.samplingRadius = samplingRadius;
  }

  private applyIfDigestible(entityManagerIndex: number, f: (digestContext: T) => void) {
    if (!(entityManagerIndex in this.entityManagerDigestContexts)) {
      return;
    }

    let context = this.entityManagerDigestContexts[entityManagerIndex];
    f(context);
  }

  /**
   * Returns false and {@param entityManager} would not be digested.
   * @param trackee in case it is needed.
   */
  protected doesDigest(entityManager: EntityManager, trackee: E): boolean {
    return true;
  }

  /**
   * Returns a context that would be passed to {@link update} along with {@param entityManager}.
   * @param trackee in case it is needed.
   * @param initialRegions regions
   */
  protected abstract makeContext(
      entityManager: EntityManager, trackee: E, initialRegions: Region[]): T;

  /**
   * Consumes an {@param event} and calls {@link update}.
   */
  digest(event: RegionChangeEvent<E>) {
    let regionChangeData = event.getDetail();
    this.applyIfDigestible(regionChangeData.entityManagerIndex, digestContext => {
      this.digestData(
          regionChangeData.entityManager,
          regionChangeData.trackee,
          regionChangeData.previousCoordinate,
          digestContext);
    });
  }

  private digestData(
      entityManager: EntityManager,
      trackee: E,
      previousCoordinate: Phaser.Point,
      digestContext: T) {
    let currCoordinate = trackee.getCoordinate();
    let enteringRegions = entityManager
        .leftOuterJoinAround(currCoordinate, previousCoordinate, this.samplingRadius);
    let exitingRegions = entityManager
        .leftOuterJoinAround(previousCoordinate, currCoordinate, this.samplingRadius);
    this.update(entityManager, trackee, enteringRegions, exitingRegions, digestContext);
  }

  private update(
      entityManager: EntityManager,
      trackee: E,
      enteringRegions: Region[],
      exitingRegions: Region[],
      digestContext: T) {
    if (enteringRegions.length > 0) {
      this.onEnter(entityManager, trackee, enteringRegions, digestContext);
    }
    if (exitingRegions.length > 0) {
      this.onExit(entityManager, trackee, exitingRegions, digestContext);
    }
    if (enteringRegions.length > 0 || exitingRegions.length > 0) {
      this.onUpdate(entityManager, trackee, digestContext);
    }
  }

  /**
   * Does everything that this digester is intended for when {@param trackee} enters some
   * {@param regions} of {@param entityManager}.
   * This method will be called immediately after {@link makeContext} if necessary.
   *
   * @param digestContext something returned by {@link makeContext}.
   */
  protected abstract onEnter(
      entityManager: EntityManager, trackee: E, regions: Region[], digestContext: T): void;

  /**
   * Does everything that this digester is intended for when {@param trackee} exits some
   * {@param regions} of {@param entityManager}.
   *
   * @param digestContext something returned by {@link makeContext}.
   */
  protected abstract onExit(
      entityManager: EntityManager, trackee: E, regions: Region[], digestContext: T): void;

  /**
   * Called when {@link onEnter} or {@link onExit} is called.
   * This method will be called immediately after {@link makeContext} if necessary.
   */
  protected onUpdate(entityManager: EntityManager, trackee: E, digestContext: T): void {
  }
}

/**
 * A {@link RegionChangeEventDigester} that does not have a context for each entity manager.
 */
export abstract class ContextlessRegionChangeEventDigester<E extends AnimatedEntity>
    extends RegionChangeEventDigester<E, void> {
  protected abstract onEnter(entityManager: EntityManager, trackee: E, regions: Region[]): void;

  protected abstract onExit(entityManager: EntityManager, trackee: E, regions: Region[]): void;
}
