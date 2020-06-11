import { Color } from './color';
import { Point } from './point';

// Entity that floats above the player and displays a comment from a user.
export type CommentEntity = PlainCommentEntity | ChromaticCommentEntity;

export interface ChromaticCommentEntity extends CommentEntityCommon {
  readonly type: 'chromatic';
}

export interface PlainCommentEntity extends CommentEntityCommon {
  readonly type: 'plain';
  readonly color: Color;
}

export interface CommentEntityCommon extends Point {
  readonly text: string;
  readonly size: number;
  readonly createdAt: Date;
  readonly userId?: string | undefined;
}

// Entity that roots in the lowest ground. Usually predefined along with the world.
export type SignEntity = SpawnPointEntity | WorldCenterEntity | WorldOriginEntity;

export interface SpawnPointEntity extends Point {
  readonly type: 'spawn_point';
  readonly text: string;
}

export interface WorldCenterEntity extends Point {
  readonly type: 'world_center';
}

export interface WorldOriginEntity extends Point {
  readonly type: 'world_origin';
}

export interface ChestEntity extends Point {
  /** `null` if the chest has been looted. */
  readonly loot: Buff | null;
}

export type Buff =
  | { readonly type: 'none' }
  | { readonly type: 'chromatic' }
  | { readonly type: 'hasty' };
