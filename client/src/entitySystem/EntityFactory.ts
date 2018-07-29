import CommentData from '../comment/CommentData';
import {PIXI} from '../util/alias/phaser';
import Point from '../util/syntax/Point';
import {ChestEntity, CommentEntity, Player, SignEntity, StationaryEntity, UpdatingCommentEntity} from './alias';

interface EntityFactory {
  createPlayer(coordinates: Point): Player;

  createCommentEntity(data: CommentData): CommentEntity;

  createUpdatingCommentEntity(data: CommentData): UpdatingCommentEntity;

  createChest(coordinates: Point): ChestEntity;

  createPointEntity(coordinates: Point): StationaryEntity;

  createSignEntity(coordinates: Point, display: PIXI.DisplayObjectContainer): SignEntity;
}

export default EntityFactory;
