import {CommentEntity, Player, Region, UpdatingCommentEntity} from './alias';
import CommentData from '../comment/CommentData';
import Point from '../util/syntax/Point';
import {BuffData} from './system/buff/BuffFactory';

interface EntityFactory {
  createPlayer(coordinates: Point): Player;

  createCommentEntity(data: CommentData): CommentEntity;

  createAnimatedCommentEntity(data: CommentData, buffData: BuffData): UpdatingCommentEntity;

  createRegion<T>(coordinates: Point, display?: PIXI.DisplayObjectContainer): Region<T>;

  /**
   * Creates a new region that has the same coordinates and display as {@param region}.
   */
  cloneRegionVisually<T>(region: Region<T>): Region<T>;
}

export default EntityFactory;
