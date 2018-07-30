import {Phaser, PIXI} from '../util/alias/phaser';
import ImmutableContainer from '../util/dataStructures/ImmutableContainer';
import Blink from './component/Blink';
import Chest from './component/Chest';
import Comment from './component/Comment';
import Display from './component/Display';
import ImmutableCoordinates from './component/ImmutableCoordinates';
import Motion from './component/Motion';
import MovingAnimation from './component/MovingAnimation';
import MutableCoordinates from './component/MutableCoordinates';
import Nudge from './component/Nudge';
import RegisteredTimes from './component/RegisteredTimes';
import UpdatingBuffCarrier from './component/UpdatingBuffCarrier';
import Entity from './Entity';

// noinspection TsLint
export type Component = {};

export type StationaryEntity = Entity & ImmutableCoordinates;
export type MovableEntity = Entity & MutableCoordinates & Motion;

export type DisplayableEntity<T = PIXI.DisplayObjectContainer> = Entity & Display<T>;

export type Region<T = Component> = StationaryEntity & ImmutableContainer<T>;

export type Updatable<T extends Component = Component> = UpdatingBuffCarrier<T> & T;

export type CommentEntity =
    StationaryEntity & Display<Phaser.Text> & Comment & RegisteredTimes & Blink;
export type UpdatingCommentEntity = Updatable<CommentEntity>;

export type Observer = MovableEntity & Display<Phaser.Sprite>;
export type Player<T extends Component = Component> =
    Updatable<Observer & MovingAnimation & Nudge & T>;

export type ChestEntity = StationaryEntity & Display<Phaser.Sprite> & Chest;

export type SignEntity = StationaryEntity & Display<PIXI.DisplayObjectContainer>;

export type Immutable<T> = T extends MutableCoordinates | Updatable ? never : T;
