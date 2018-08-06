import CommentData from '../comment/CommentData';
import {Phaser, PIXI} from '../util/alias/phaser';
import {ChestEntity, CommentEntity, Player, SignEntity, StationaryEntity, UpdatingCommentEntity} from './alias';

interface EntityFactory {
  createPlayer(coordinates: Phaser.ReadonlyPoint): Player;

  createCommentEntity(data: CommentData): CommentEntity;

  createUpdatingCommentEntity(data: CommentData): UpdatingCommentEntity;

  createChest(coordinates: Phaser.ReadonlyPoint): ChestEntity;

  createPointEntity(coordinates: Phaser.ReadonlyPoint): StationaryEntity;

  createSignEntity(
      coordinates: Phaser.ReadonlyPoint,
      display: PIXI.DisplayObjectContainer): SignEntity;
}

export default EntityFactory;
