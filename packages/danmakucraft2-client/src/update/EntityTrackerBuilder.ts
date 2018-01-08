import Entity from '../entitySystem/Entity';
import EntityFinder from '../util/entityStorage/EntityFinder';
import ExistenceSystem from '../entitySystem/system/existence/ExistenceSystem';
import TickSystem from '../entitySystem/system/tick/TickSystem';
import DynamicProvider from '../util/DynamicProvider';
import PhysicalConstants from '../PhysicalConstants';
import EntityTracker, {
  DistanceChecker, EntityFinderRecord, ExistenceSystemTicker, SystemTicker,
  TickSystemTicker, UpdateRelation
} from './EntityTracker';

export class EntityTrackerBuilder {
  constructor(
      private trackee: Entity,
      private samplingRadius: DynamicProvider<number>,
      updatingRadius: number = PhysicalConstants.ENTITY_TRACKER_UPDATE_RADIUS,
      private distanceChecker: DistanceChecker =
          new DistanceChecker(trackee, samplingRadius, updatingRadius),
      private entityFinderRecords: Map<EntityFinder<Entity>, EntityFinderRecord<Entity>> = new Map(),
      private systemTickers: Array<SystemTicker<Entity>> = [],
      private updateRelations: Array<UpdateRelation<Entity, Entity>> = []) {
  }

  applyExistenceSystem<T, U extends T & Entity>(
      system: ExistenceSystem<T>, entityFinder: EntityFinder<U>) {
    let systemTicker = new ExistenceSystemTicker(system);
    this.addSystemTickerAndEntityFinder<T, U>(systemTicker, entityFinder);
    return this;
  }

  applyTickSystem<T, U extends T & Entity>(system: TickSystem<T>, entityFinder: EntityFinder<U>) {
    let systemTicker = new TickSystemTicker(system);
    this.addSystemTickerAndEntityFinder<T, U>(systemTicker, entityFinder);
    return this;
  }

  build() {
    if (this.systemTickers.length === 0) {
      throw new TypeError('No systems were applied');
    }
    return new EntityTracker(
        this.trackee,
        this.samplingRadius,
        this.systemTickers,
        Array.from(this.entityFinderRecords.values()),
        this.updateRelations,
        this.distanceChecker);
  }

  private addSystemTickerAndEntityFinder<T, U extends T & Entity>(
      systemTicker: SystemTicker<T>, entityFinder: EntityFinder<U>) {
    this.systemTickers.push(systemTicker);

    let entityFinderRecord = this.entityFinderRecords.get(entityFinder) as EntityFinderRecord<U>;
    if (entityFinderRecord === undefined) {
      entityFinderRecord = new EntityFinderRecord(entityFinder, this.distanceChecker);
      this.entityFinderRecords.set(entityFinder, entityFinderRecord);
    }

    this.updateRelations.push(new UpdateRelation(systemTicker, entityFinderRecord));
  }
}

export default EntityTrackerBuilder;
