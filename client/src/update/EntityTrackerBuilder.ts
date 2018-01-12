import Entity from '../entitySystem/Entity';
import EntityFinder from '../util/entityStorage/EntityFinder';
import ExistenceSystem from '../entitySystem/system/existence/ExistenceSystem';
import DynamicProvider from '../util/DynamicProvider';
import PhysicalConstants from '../PhysicalConstants';
import EntityTracker, {
  DistanceChecker, EntityFinderRecord, RecordSystemTicker, SystemTicker,
  TickSystemTicker,
} from './EntityTracker';
import TickSystem from '../entitySystem/system/tick/TickSystem';
import {asSequence} from 'sequency';

export class EntityTrackerBuilder {
  constructor(
      private trackee: Entity,
      private samplingRadius: DynamicProvider<number>,
      updatingRadius: number = PhysicalConstants.ENTITY_TRACKER_UPDATE_RADIUS,
      private distanceChecker: DistanceChecker =
          new DistanceChecker(trackee, samplingRadius, updatingRadius),
      private entityFinderRecords: Map<EntityFinder<Entity>, EntityFinderRecord<Entity>> = new Map(),
      private onUpdateSystemTickers: SystemTicker[] = [],
      private onRenderSystemTickers: SystemTicker[] = []) {
  }

  applyExistenceSystem<T, U extends T & Entity>(
      system: ExistenceSystem<T>,
      entityFinder: EntityFinder<U>,
      isOnUpdate: boolean) {
    let entityFinderRecord = this.entityFinderRecords.get(entityFinder) as EntityFinderRecord<U>;
    if (entityFinderRecord === undefined) {
      entityFinderRecord = new EntityFinderRecord(entityFinder, this.distanceChecker);
      this.entityFinderRecords.set(entityFinder, entityFinderRecord);
    }

    let ticker = new RecordSystemTicker(system, entityFinderRecord);
    this.addTicker(ticker, isOnUpdate);

    return this;
  }

  applyTickSystem(system: TickSystem, isOnUpdate: boolean) {
    this.addTicker(new TickSystemTicker(system), isOnUpdate);
    return this;
  }

  build() {
    if (!asSequence([this.onUpdateSystemTickers, this.onUpdateSystemTickers]).any()) {
      throw new TypeError('No systems were applied');
    }
    return new EntityTracker(
        this.trackee,
        this.samplingRadius,
        this.onUpdateSystemTickers,
        this.onRenderSystemTickers,
        Array.from(this.entityFinderRecords.values()),
        this.distanceChecker);
  }

  private addTicker(ticker: SystemTicker, isOnUpdate: boolean) {
    let tickers;
    if (isOnUpdate) {
      tickers = this.onUpdateSystemTickers;
    } else {
      tickers = this.onRenderSystemTickers;
    }

    tickers.push(ticker);
  }
}

export default EntityTrackerBuilder;
