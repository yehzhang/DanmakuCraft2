import MaybeDisplay from './component/MaybeDisplay';
import Motion from './component/Motion';
import ImmutableCoordinates from './component/ImmutableCoordinates';
import MutableCoordinates from './component/MutableCoordinates';
import Display from './component/Display';
import Comment from './component/Comment';
import Entity from './Entity';
import UpdatingBuffCarrier from './component/UpdatingBuffCarrier';
import MovingAnimation from './component/MovingAnimation';
import ContainerHolder from './component/ContainerHolder';

// noinspection TsLint
export type Component = {};

export type StationaryEntity = Entity & ImmutableCoordinates;
export type MovableEntity = Entity & MutableCoordinates & Motion;

export type ExistentEntity<T extends PIXI.DisplayObject = PIXI.DisplayObject> = Entity & Display<T>;
export type SuperposedEntity<T extends PIXI.DisplayObject = PIXI.DisplayObject> =
    Entity & MaybeDisplay<T>;
export type Renderable<T extends PIXI.DisplayObject = PIXI.DisplayObject> =
    Display<T> | MaybeDisplay<T>;
export type RenderableEntity<T extends PIXI.DisplayObject = PIXI.DisplayObject> =
    Renderable<T> & Entity;

export type Region<T = Component> =
    StationaryEntity & ContainerHolder<T> & MaybeDisplay<PIXI.DisplayObjectContainer>;

export type Updatable<T extends Component = Component> = UpdatingBuffCarrier<T> & T;

export type CommentEntity = StationaryEntity & Comment & MaybeDisplay<Phaser.Text>;
export type UpdatingCommentEntity = Updatable<CommentEntity>;

export type Observer = MovableEntity & Display<Phaser.Sprite>;
export type Player<T extends Component = Component> = Updatable<Observer & MovingAnimation & T>;
export type NonPlayerCharacter<T extends Component = Component> =
    Updatable<MovableEntity & MaybeDisplay<Phaser.Sprite>>;

export type TinyTelevision = Player;

export type PartialEntity<T extends Entity> = Partial<T> & Entity;
