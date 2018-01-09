import EntityTrackerBuilder from '../../../client/src/update/EntityTrackerBuilder';
import {instance, mock, when} from 'ts-mockito';
import Entity from '../../../client/src/entitySystem/Entity';
import DynamicProvider from '../../../client/src/util/DynamicProvider';
import UpdateSystem from '../../../client/src/entitySystem/system/tick/UpdateSystem';
import SuperposedEntityRenderSystem from '../../../client/src/entitySystem/system/existence/SuperposedEntityRenderSystem';
import TickSystem from '../../../client/src/entitySystem/system/tick/TickSystem';
import ExistenceSystem from '../../../client/src/entitySystem/system/existence/ExistenceSystem';
import EntityFinder from '../../../client/src/util/entityStorage/EntityFinder';
import ChunkEntityFinder from '../../../client/src/util/entityStorage/chunk/ChunkEntityFinder';
import {expect} from 'chai';
import {UpdateRelation} from '../../../client/src/update/EntityTracker';
import {asSequence} from 'sequency';
import Point from '../../../client/src/util/syntax/Point';
import {Phaser} from '../../../client/src/util/alias/phaser';

describe('EntityTrackerBuilder', () => {
  let builder: EntityTrackerBuilder;
  let mockTrackee: Entity;
  let mockEntityFinders: Array<EntityFinder<Entity>>;
  let entityFinders: Array<EntityFinder<Entity>>;
  let mockExistenceSystems: Array<ExistenceSystem<Entity>>;
  let existenceSystems: Array<ExistenceSystem<Entity>>;
  let mockTickSystems: Array<TickSystem<any>>;
  let tickSystems: Array<TickSystem<any>>;

  beforeEach(() => {
    mockTrackee = mock(Entity);
    mockTickSystems = [
      mock(UpdateSystem),
      mock(UpdateSystem)];
    tickSystems = mockTickSystems.map(instance);
    mockExistenceSystems = [
      mock(SuperposedEntityRenderSystem),
      mock(SuperposedEntityRenderSystem)];
    existenceSystems = mockExistenceSystems.map(instance);
    mockEntityFinders = [
      mock(ChunkEntityFinder),
      mock(ChunkEntityFinder)];
    entityFinders = mockEntityFinders.map(instance);

    when(mockEntityFinders[0].entityExistenceUpdated).thenReturn(new Phaser.Signal());
    when(mockEntityFinders[1].entityExistenceUpdated).thenReturn(new Phaser.Signal());
    when(mockTrackee.coordinates).thenReturn(Point.origin());

    builder = new EntityTrackerBuilder(instance(mockTrackee), new DynamicProvider(0))
        .applyTickSystem(tickSystems[0], entityFinders[0])
        .applyExistenceSystem(existenceSystems[0], entityFinders[1])
        .applyTickSystem(tickSystems[1], entityFinders[1])
        .applyExistenceSystem(existenceSystems[1], entityFinders[0]);
  });

  it('should keeps system tickers in order', () => {
    let tracker = builder.build();

    let systems = tracker['systemTickers'].map((ticker: any) => ticker['system']);
    expect(systems[0]).to.equal(tickSystems[0]);
    expect(systems[1]).to.equal(existenceSystems[0]);
    expect(systems[2]).to.equal(tickSystems[1]);
    expect(systems[3]).to.equal(existenceSystems[1]);
  });

  it('should keeps update relations in order', () => {
    let tracker = builder.build();

    let relations = tracker['updateRelations'];
    let tickers = tracker['systemTickers'];
    let records = tracker['entityFinderRecords'];
    expect(relations).to.deep.equal([
      new UpdateRelation(tickers[0], records[0]),
      new UpdateRelation(tickers[1], records[1]),
      new UpdateRelation(tickers[2], records[1]),
      new UpdateRelation(tickers[3], records[0])]);
  });

  it('should create exactly one record for each entity finder', () => {
    let tracker = builder.build();

    let actualEntityFinders = asSequence(tracker['entityFinderRecords'])
        .map(record => record['entityFinder'])
        .toSet();
    expect(actualEntityFinders).to.deep.equal(new Set(entityFinders));
  });
});
