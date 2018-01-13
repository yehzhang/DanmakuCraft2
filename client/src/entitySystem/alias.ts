import Motion from './component/Motion';
import ImmutableCoordinates from './component/ImmutableCoordinates';
import MutableCoordinates from './component/MutableCoordinates';
import Display from './component/Display';
import Comment from './component/Comment';
import Entity from './Entity';
import UpdatingBuffCarrier from './component/UpdatingBuffCarrier';
import MovingAnimation from './component/MovingAnimation';
import ContainerHolder from './component/ContainerHolder';
import Chest from './component/Chest';
import {Phaser, PIXI} from '../util/alias/phaser';

// noinspection TsLint
export type Component = {};

export type StationaryEntity = Entity & ImmutableCoordinates;
export type MovableEntity = Entity & MutableCoordinates & Motion;

export type Region<T = Component> =
    StationaryEntity & ContainerHolder<T> & Display<PIXI.DisplayObjectContainer>;

export type Updatable<T extends Component = Component> = UpdatingBuffCarrier<T> & T;

export type CommentEntity = StationaryEntity & Display<Phaser.Text> & Comment;
export type UpdatingCommentEntity = Updatable<CommentEntity>;

export type Observer = MovableEntity & Display<Phaser.Sprite>;
export type Player<T extends Component = Component> = Updatable<Observer & MovingAnimation & T>;

export type ChestEntity = StationaryEntity & Display<Phaser.Sprite> & Chest;
