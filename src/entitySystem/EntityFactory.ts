import {CommentEntity, Player, Region, UpdatingCommentEntity} from './alias';
import CommentData from '../comment/CommentData';
import Entity from './Entity';
import Point from '../util/Point';
import {BuffData} from './system/buff/BuffFactory';

interface EntityFactory {
  createPlayer(coordinates: Point): Player;

  createCommentEntity(data: CommentData): CommentEntity;

  createAnimatedCommentEntity(data: CommentData, buffData: BuffData): UpdatingCommentEntity;

  createRegion<T extends Entity>(coordinates: Point): Region<T>;
}

export default EntityFactory;
