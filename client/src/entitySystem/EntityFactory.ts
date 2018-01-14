import {
  ChestEntity, CommentEntity, Player, Region, SignEntity, StationaryEntity,
  UpdatingCommentEntity
} from './alias';
import CommentData from '../comment/CommentData';
import Point from '../util/syntax/Point';
import {PIXI} from '../util/alias/phaser';
import ImmutableContainer from '../util/entityStorage/ImmutableContainer';

interface EntityFactory {
  createPlayer(coordinates: Point): Player;

  createCommentEntity(data: CommentData): CommentEntity;

  createUpdatingCommentEntity(data: CommentData): UpdatingCommentEntity;

  createRegion<T>(
      coordinates: Point,
      container?: ImmutableContainer<T>,
      display?: PIXI.DisplayObjectContainer): Region<T>;

  createChest(coordinates: Point): ChestEntity;

  createPointEntity(coordinates: Point): StationaryEntity;

  createSignEntity(coordinates: Point, display: PIXI.DisplayObjectContainer): SignEntity;
}

export default EntityFactory;
