import Motion from './component/Motion';
import ImmutableCoordinates from './component/ImmutableCoordinates';
import MutableCoordinates from './component/MutableCoordinates';
import Display from './component/Display';
import Comment from './component/Comment';
import Entity from './Entity';
import UpdatingBuffCarrier from './component/UpdatingBuffCarrier';
import MovingAnimation from './component/MovingAnimation';
import Chest from './component/Chest';
import {Phaser, PIXI} from '../util/alias/phaser';
import RegisteredTimes from './component/RegisteredTimes';
import Blink from './component/Blink';
import Nudge from './component/Nudge';
import ImmutableContainer from '../util/entityStorage/ImmutableContainer';

// noinspection TsLint
export type Component = {};

export type StationaryEntity = Entity & ImmutableCoordinates;
export type MovableEntity = Entity & MutableCoordinates & Motion;

export type DisplayableEntity<T = PIXI.DisplayObjectContainer> = Entity & Display<T>;

export type Region<T = Component> = StationaryEntity & ImmutableContainer<T>;
export type DisplayableRegion<T = Component> = Region<T> & Display<PIXI.DisplayObjectContainer>;

export type Updatable<T extends Component = Component> = UpdatingBuffCarrier<T> & T;

export type CommentEntity =
    StationaryEntity & Display<Phaser.Text> & Comment & RegisteredTimes & Blink;
export type UpdatingCommentEntity = Updatable<CommentEntity>;

export type Observer = MovableEntity & Display<Phaser.Sprite>;
export type Player<T extends Component = Component> =
    Updatable<Observer & MovingAnimation & Nudge & T>;

export type ChestEntity = StationaryEntity & Display<Phaser.Sprite> & Chest;

export type SignEntity = StationaryEntity & Display<PIXI.DisplayObjectContainer>;
