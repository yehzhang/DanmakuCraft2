import {AnimatedEntity, SuperposedEntity} from '../entity/entity';
import EntityManager, {Region} from '../entity/EntityManager';

/**
 * Listens on changes produced by {@link EntityTracker}.
 */
export default abstract class EntityTrackerListener<
    T extends AnimatedEntity = AnimatedEntity, E extends SuperposedEntity = SuperposedEntity> {
  update(
      entityManager: EntityManager<E>,
      trackee: T,
      enteringRegions: Array<Region<E>>,
      exitingRegions: Array<Region<E>>) {
    let hasEnteringRegions = enteringRegions.length > 0;
    if (hasEnteringRegions) {
      this.onEnter(entityManager, trackee, enteringRegions);
    }

    let hasExitingRegions = exitingRegions.length > 0;
    if (hasExitingRegions) {
      this.onExit(entityManager, trackee, exitingRegions);
    }

    if (hasEnteringRegions || hasExitingRegions) {
      this.onUpdate(entityManager, trackee);
    }
  }

  /**
   * Does everything that this digester is intended for when {@param trackee} enters some
   * {@param regions} of {@param entityManager}.
   * This method will be called after {@link makeContext} if necessary.
   *
   * @param digestContext something returned by {@link makeContext}.
   */
  protected abstract onEnter(
      entityManager: EntityManager<E>, trackee: T, regions: Array<Region<E>>): void;

  /**
   * Does everything that this digester is intended for when {@param trackee} exits some
   * {@param regions} of {@param entityManager}.
   *
   * @param digestContext something returned by {@link makeContext}.
   */
  protected abstract onExit(
      entityManager: EntityManager<E>, trackee: T, regions: Array<Region<E>>): void;

  /**
   * Called when {@link onEnter} or {@link onExit} is called.
   * This method will be called after {@link makeContext} if necessary.
   */
  protected onUpdate(entityManager: EntityManager<E>, trackee: T): void {
  }
}
