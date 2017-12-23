import {CommentEntity, Player, Region, UpdatingCommentEntity} from './alias';
import CommentData from '../comment/CommentData';
import Point from '../util/syntax/Point';
import {BuffData} from './system/buff/BuffFactory';

interface EntityFactory {
  createPlayer(coordinates: Point): Player;

  createCommentEntity(data: CommentData): CommentEntity;

  createAnimatedCommentEntity(data: CommentData, buffData: BuffData): UpdatingCommentEntity;

  createRegion<T>(coordinates: Point, display?: PIXI.DisplayObjectContainer): Region<T>;

  cloneRegion<T>(region: Region<T>): Region<T>;
}

export default EntityFactory;
