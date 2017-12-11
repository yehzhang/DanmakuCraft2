import MaybeDisplay from './component/MaybeDisplay';
import EntityContainer from './component/EntityContainer';
import Motion from './component/Motion';
import ImmutableCoordinates from './component/ImmutableCoordinates';
import MutableCoordinates from './component/MutableCoordinates';
import Display from './component/Display';
import Comment from './component/Comment';
import Entity from './Entity';
import UpdatingBuffCarrier from './component/UpdatingBuffCarrier';
import MovingAnimation from './component/MovingAnimation';

// noinspection TsLint
export type Component = {};

export type StationaryEntity = ImmutableCoordinates;
export type MovableEntity = MutableCoordinates & Motion;

export type ExistentEntity<T extends PIXI.DisplayObjectContainer = PIXI.DisplayObjectContainer> =
    Entity & Display<T>;
export type SuperposedEntity<T extends PIXI.DisplayObjectContainer = PIXI.DisplayObjectContainer> =
    Entity & MaybeDisplay<T>;

export type Region<T extends Entity = Entity> =
    StationaryEntity & EntityContainer<T> & MaybeDisplay<PIXI.DisplayObjectContainer>;

export type Updatable<T extends Component = Component> = UpdatingBuffCarrier<T> & T;

export type CommentEntity = StationaryEntity & Comment & MaybeDisplay<Phaser.Text>;
export type UpdatingCommentEntity = Updatable<CommentEntity>;

export type Observer = MovableEntity & Display<Phaser.Sprite>;
export type Player<T extends Component = Component> = Updatable<Observer & T>;
export type NonPlayerCharacter<T extends Component = Component> =
    Updatable<MovableEntity & MaybeDisplay<Phaser.Sprite>>;

export type TinyTelevision = Player<MovingAnimation>;

export type PartialEntity<T extends Entity> = Partial<T> & Entity;
