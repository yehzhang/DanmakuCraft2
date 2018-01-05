import {ChestEntity, CommentEntity, Player, Region, UpdatingCommentEntity} from './alias';
import CommentData from '../comment/CommentData';
import Point from '../util/syntax/Point';

interface EntityFactory {
  createPlayer(coordinates: Point): Player;

  createCommentEntity(data: CommentData): CommentEntity;

  createUpdatingCommentEntity(data: CommentData): UpdatingCommentEntity;

  createRegion<T>(coordinates: Point, display?: PIXI.DisplayObjectContainer): Region<T>;

  cloneRegion<T>(region: Region<T>): Region<T>;

  createChest(coordinates: Point): ChestEntity;
}

export default EntityFactory;
