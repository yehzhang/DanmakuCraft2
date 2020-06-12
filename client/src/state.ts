import { Howl } from 'howler';
import { Channel1 } from './data/channel';
import { Color } from './data/color';
import { ChestEntity, CommentEntity, SignEntity } from './data/entity';
import { EntityIndex } from './data/entityIndex';
import { I18nTextIdentifier } from './data/i18n';
import { Point } from './data/point';

export interface State {
  readonly cameraPosition: Point;
  readonly movement: MovementState;
  readonly player: PlayerState;
  readonly hastyRemainingMs: number;
  readonly chest: ChestState;
  readonly containerSize: Point;
  readonly commentEntities: EntitiesState<CommentEntity>;
  readonly signEntities: EntitiesState<SignEntity>;
  readonly notification: NotificationState | null;
  readonly consoleEntries: ConsoleEntries;
  readonly consoleDisplayLevel: ConsoleDisplayLevel;
  readonly focus: FocusTarget | null;
  readonly commentInputText: string;
  readonly commentInputSize: number;
  readonly commentInputColor: Color;
  readonly commentInputSubmitting: boolean;
  readonly view: ViewName;
  readonly volume: VolumeState;
  readonly sendChromaticComment: boolean;
  readonly tutorial: TutorialState;
  readonly domain: DomainState;
  readonly backgroundMusic: BackgroundMusicState;
  readonly receivedCommentEntities: ReceivedCommentEntityState;
  readonly user: UserState | null;
  readonly authenticated: boolean;
}

export interface PlayerState {
  readonly position: Point;
  readonly pixelStepping: PixelSteppingState | null;
  readonly fly: boolean;
}

export interface EntitiesState<T> {
  readonly data: IdKeyed<T>;
  readonly index: EntityIndex<T>;
}
export interface IdKeyed<T> {
  readonly [id: string]: T;
}

export interface MovementState {
  readonly up: number;
  readonly down: number;
  readonly left: number;
  readonly right: number;
}

export type ChestState = ChestIdleState | ChestSpawningState | ChestSpawnedState;

export interface ChestIdleState {
  readonly type: 'initial';
}

export interface ChestSpawningState {
  readonly type: 'spawning';
  readonly spawnInMs: number;
}

export interface ChestSpawnedState {
  readonly type: 'spawned';
  readonly id: string;
  readonly chestEntity: ChestEntity;
}

// Implemented with an object to uniquely identify each notification.
export interface NotificationState {
  readonly id: string;
  readonly message: I18nTextIdentifier | JustText;
}

export interface ConsoleEntry {
  readonly caption: string;
  readonly entityPosition?: Point;
  readonly note?: string | null;
  readonly navigation?: boolean;
}

export interface ConsoleEntries {
  readonly [key: string]: ConsoleEntry;
}

export interface JustText {
  readonly just: string;
}

export type FocusTarget = 'stage' | 'comment_input';

export type ViewName = 'opening' | 'main';

export type VolumeState = Channel1;

export interface PixelSteppingState {
  readonly expireInMs: number;
  readonly startPoint: Point;
}

export interface TutorialState {
  readonly stage: TutorialStage;
  readonly msSinceThisStage: number;
  readonly moved: boolean;
  readonly enterKeyPressed: boolean;
}

export type TutorialStage =
  | 'preMovementKeys'
  | 'firstMovementKeys'
  | 'secondMovementKeys'
  | 'finalMovementKeys'
  | 'preCommentKeys'
  | 'commentKeys'
  | 'end';

export type ConsoleDisplayLevel = 'none' | 'info';

export interface DanmakuCraftDomainState {
  readonly type: 'danmakucraft';
}
export interface BilibiliDomainState {
  readonly type: 'bilibili';
  readonly externalDependency: BilibiliExternalDependency | null;
}
export interface BilibiliExternalDependency {
  readonly $: JQueryStatic;
}
export type DomainState = DanmakuCraftDomainState | BilibiliDomainState;

export type BackgroundMusicState = Howl | null;

export interface ReceivedCommentEntityState {
  [commentEntityId: string]: Date;
}

export interface UserState {
  readonly userId: string;
  readonly sessionToken: string;
}
