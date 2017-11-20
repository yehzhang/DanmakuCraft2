import {AnimatedEntity} from '../entity/entity';
import {EntityManager, Region} from '../entity/EntityManager';
import {PhysicalConstants} from '../Universe';
import EntityTracker, {RegionChangeEvent} from './EntityTracker';

/**
 * Takes an {@link RegionChangeEvent} and produces some fine-grained result.
 * Calls {@link onEnter} when {@link entityTracker}'s trackee enters some new regions,
 * calls {@link onExit} when {@link entityTracker}'s trackee exits some old regions, and
 * calls {@link onUpdate} when either of the two methods above is called.
 *
 * Does not call those methods if the regions related to trackee are not changed.
 */
export default abstract class RegionChangeEventDigester<E extends AnimatedEntity, T> {
  private entityManagerDigestContexts: { [entityManagerIndex: number]: DigestContext<T> };

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
      let userContext = this.makeContext(entityManager, trackee, initialRegions);
      let digestContext = new DigestContext(initialRegions, userContext);
      this.entityManagerDigestContexts[entityManagerIndex] = digestContext;

      this.update(entityManager, trackee, digestContext);
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

    this.samplingRadius = samplingRadius;

    let trackee = this.entityTracker.getTrackee();
    this.entityTracker.forEach((entityManager, entityManagerIndex) => {
      this.applyIfDigestible(entityManagerIndex, digestContext => {
        this.update(entityManager, trackee, digestContext);
      });
    });
  }

  private applyIfDigestible(
      entityManagerIndex: number, f: (digestContext: DigestContext<T>) => void) {
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
      this.update(regionChangeData.entityManager, regionChangeData.trackee, digestContext);
    });
  }

  private update(entityManager: EntityManager, trackee: E, digestContext: DigestContext<T>) {
    let currentCoordinate = trackee.getCoordinate();
    let newRegions = entityManager.listAround(currentCoordinate, this.samplingRadius);
    let newRegionsSet = RegionSet.from(newRegions);

    let enteringRegions = newRegionsSet.leftOuterJoin(digestContext.currentRegions);
    let hasEnteringRegions = enteringRegions.length > 0;
    if (hasEnteringRegions) {
      enteringRegions.forEach(RegionSet.prototype.add, digestContext.currentRegions);

      this.onEnter(entityManager, trackee, enteringRegions, digestContext.userContext);
    }

    let exitingRegions = digestContext.currentRegions.leftOuterJoin(newRegionsSet);
    let hasExitingRegions = exitingRegions.length > 0;
    if (hasExitingRegions) {
      exitingRegions.forEach(RegionSet.prototype.remove, digestContext.currentRegions);

      this.onExit(entityManager, trackee, exitingRegions, digestContext.userContext);
    }

    if (hasEnteringRegions || hasExitingRegions) {
      this.onUpdate(entityManager, trackee, digestContext.userContext);
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

class DigestContext<T> {
  public currentRegions: RegionSet;

  constructor(initialRegions: Region[], public userContext: T) {
    this.currentRegions = RegionSet.from(initialRegions);
  }
}

class RegionSet {
  private set: { [regionId: string]: Region };

  constructor() {
    this.set = {};
  }

  static from(regions: Region[]) {
    let set = new this();

    for (let region of regions) {
      set.add(region);
    }

    return set;
  }

  add(region: Region): void {
    this.set[region.id] = region;
  }

  remove(region: Region): void {
    delete this.set[region.id];
  }

  leftOuterJoin(set: RegionSet): Region[] {
    return Object.keys(this.set)
        .filter(regionId => !(regionId in set.set))
        .map(regionId => this.set[regionId]);
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
