import EntityFactory from './EntityFactory';
import {CommentEntity, Player, Region, TinyTelevision, UpdatingCommentEntity} from './alias';
import CommentData from '../comment/CommentData';
import Comment from './component/Comment';
import Entity, {EntityBuilder} from './Entity';
import ImmutableCoordinates from './component/ImmutableCoordinates';
import EntityContainer from './component/EntityContainer';
import MaybeDisplay from './component/MaybeDisplay';
import BuffFactory, {BuffData} from './system/buff/BuffFactory';
import UpdatingBuffCarrier from './component/UpdatingBuffCarrier';
import MutableCoordinates from './component/MutableCoordinates';
import Motion from './component/Motion';
import Display from './component/Display';
import MovingAnimation from './component/MovingAnimation';
import GraphicsFactory from '../render/graphics/GraphicsFactory';
import Point from '../util/Point';
import ArrayContainer from '../util/entityFinder/ArrayContainer';

class EntityFactoryImpl implements EntityFactory {
  constructor(
      private game: Phaser.Game,
      private graphicsFactory: GraphicsFactory,
      private buffFactory: BuffFactory) {
  }

  private static createBaseCommentEntity<T extends CommentEntity>(
      data: CommentData, createDisplay: () => Phaser.Text): EntityBuilder<T, CommentEntity> {
    let coordinates = new Phaser.Point(data.coordinateX, data.coordinateY);
    return Entity.newBuilder<CommentEntity>()
        .mix(new ImmutableCoordinates(coordinates))
        .mix(new Comment(data.size, data.color, data.text))
        .mix(new MaybeDisplay(createDisplay));
  }

  createRegion<T extends Entity>(coordinates: Point) {
    return Entity.newBuilder<Region<T>>()
        .mix(new ImmutableCoordinates(coordinates))
        .mix(new EntityContainer(new ArrayContainer<T>()))
        .mix(new MaybeDisplay(() => new PIXI.DisplayObjectContainer()))
        .build();
  }

  createPlayer(coordinates: Point): Player {
    return this.createTinyTelevision(coordinates);
  }

  createTinyTelevision(coordinates: Point): TinyTelevision {
    let builtDisplay = this.graphicsFactory.newTinyTelevisionBuilder()
        .pushFrame(0).withShadow()
        .pushFrame(1).withShadow()
        .pushFrame(2).withShadow()
        .build();
    let entity = Entity.newBuilder()
        .mix(new MutableCoordinates(coordinates))
        .mix(new Motion(1, 0))
        .mix(new Display(builtDisplay.display))
        .mix(new MovingAnimation(builtDisplay.walkingAnimation))
        .mix(new UpdatingBuffCarrier())
        .build();

    this.buffFactory.createInputControllerMover().apply(entity);

    return entity;
  }

  createCommentEntity(data: CommentData) {
    let entity: CommentEntity = EntityFactoryImpl
        .createBaseCommentEntity(data, () => this.graphicsFactory.createTextFromComment(entity))
        .build();
    return entity;
  }

  createAnimatedCommentEntity(data: CommentData, buffData: BuffData): UpdatingCommentEntity {
    let entity: UpdatingCommentEntity =
        EntityFactoryImpl.createBaseCommentEntity<any>(
            data, () => this.graphicsFactory.createTextFromComment(entity))
            .mix(new UpdatingBuffCarrier<UpdatingCommentEntity>())
            .build();

    this.buffFactory.create(buffData).apply(entity);

    return entity;
  }
}

export default EntityFactoryImpl;
