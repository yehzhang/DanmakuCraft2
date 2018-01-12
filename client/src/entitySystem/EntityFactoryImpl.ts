import EntityFactory from './EntityFactory';
import {CommentEntity, Region, UpdatingCommentEntity} from './alias';
import CommentData from '../comment/CommentData';
import Comment from './component/Comment';
import Entity, {EntityBuilder} from './Entity';
import ImmutableCoordinates from './component/ImmutableCoordinates';
import MaybeDisplay from './component/MaybeDisplay';
import BuffFactory from './system/buff/BuffFactory';
import UpdatingBuffCarrier from './component/UpdatingBuffCarrier';
import MutableCoordinates from './component/MutableCoordinates';
import Motion from './component/Motion';
import Display from './component/Display';
import MovingAnimation from './component/MovingAnimation';
import GraphicsFactory from '../render/graphics/GraphicsFactory';
import Point from '../util/syntax/Point';
import ArrayContainer from '../util/entityStorage/chunk/ArrayContainer';
import ContainerHolder from './component/ContainerHolder';
import Chest from './component/Chest';
import {Phaser, PIXI} from '../util/alias/phaser';

class EntityFactoryImpl implements EntityFactory {
  constructor(
      private game: Phaser.Game,
      private graphicsFactory: GraphicsFactory,
      private buffFactory: BuffFactory) {
  }

  createRegion<T>(coordinates: Point) {
    return Entity.newBuilder<Region<T>>()
        .mix(new ImmutableCoordinates(coordinates))
        .mix(new ContainerHolder(new ArrayContainer<T>()))
        .mix(new MaybeDisplay(new PIXI.DisplayObjectContainer()))
        .build();
  }

  createCommentEntity(data: CommentData) {
    return this.createBaseCommentEntity(data).build();
  }

  cloneRegion<T>(region: Region<T>) {
    let newRegion = this.createRegion<T>(region.coordinates);

    for (let entity of region.container) {
      newRegion.container.add(entity);
    }

    return newRegion;
  }

  createPlayer(coordinates: Point) {
    return this.createTinyTelevision(coordinates);
  }

  createTinyTelevision(coordinates: Point) {
    let view = this.graphicsFactory.createTinyTelevision();
    let entity = Entity.newBuilder()
        .mix(new MutableCoordinates(coordinates))
        .mix(new Motion())
        .mix(new Display(view.display))
        .mix(new MovingAnimation(view.walkingAnimation))
        .mix(new UpdatingBuffCarrier())
        .build();

    this.buffFactory.createInputControllerMover().apply(entity);

    return entity;
  }

  createUpdatingCommentEntity(data: CommentData) {
    return this.createBaseCommentEntity(data)
        .mix(new UpdatingBuffCarrier<UpdatingCommentEntity>())
        .build();
  }

  private createBaseCommentEntity(data: CommentData): EntityBuilder<CommentEntity> {
    let comment = new Comment(data.size, data.color, data.text);
    return Entity.newBuilder<CommentEntity>()
        .mix(new ImmutableCoordinates(data.coordinates))
        .mix(comment)
        .mix(new MaybeDisplay(this.graphicsFactory.createTextFromComment(comment)));
  }

  createChest(coordinates: Point) {
    return Entity.newBuilder()
        .mix(new ImmutableCoordinates(coordinates))
        .mix(new Display(this.graphicsFactory.createChest()))
        .mix(new Chest())
        .build();
  }
}

export default EntityFactoryImpl;
