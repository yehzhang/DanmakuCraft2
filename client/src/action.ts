import { Howl } from 'howler';
import { Color } from './data/color';
import {
  Buff,
  ChromaticCommentEntity,
  CommentEntity,
  PlainCommentEntity,
  SignEntity,
} from './data/entity';
import { Point } from './data/point';
import { ConsoleDisplayLevel, ConsoleEntry, IdKeyed, State, ViewName } from './state';

export type Action =
  | { type: '[StageControl] up'; keyDown: boolean }
  | { type: '[StageControl] down'; keyDown: boolean }
  | { type: '[StageControl] left'; keyDown: boolean }
  | { type: '[StageControl] right'; keyDown: boolean }
  | {
      type: '[StageControl] enter';
      keyDown: boolean;
      view: ViewName;
      commentInputSubmitting: boolean;
    }
  | { type: '[StageControl] focused' }
  | { type: '[StageControl] blurred' }
  | { type: '[StageControl] context menu opened' }
  | { type: '[Stage] resized'; size: Point }
  | { type: '[Ticker] ticked'; deltaMs: number; state: State }
  | { type: '[Chest] opened by player'; buff: Buff }
  | { type: '[SpeechBubble] display expired' }
  | { type: '[Opening] genesis'; spawnPosition: Point; signEntities: IdKeyed<SignEntity> }
  | { type: '[index] comment entities loaded'; commentEntities: IdKeyed<CommentEntity> }
  | { type: '[index] background music created'; album: Howl }
  | { type: '[Opening] completed' }
  | { type: '[AuthDialog] invalid session token' }
  | { type: '[AuthDialog] valid session token' }
  | { type: '[EmailAuthForm] signed in'; userId: string; sessionToken: string }
  | { type: '[EmailAuthForm] signed up'; userId: string; sessionToken: string }
  | { type: '[ConsoleInput] chest wanted'; position: Point; lootType: Buff['type'] }
  | { type: '[ConsoleInput] comment wanted'; id: string; commentEntity: PlainCommentEntity }
  | {
      type: '[ConsoleInput] chromatic comment wanted';
      id: string;
      commentEntity: ChromaticCommentEntity;
    }
  | { type: '[ConsoleInput] notification pushed'; text: string }
  | { type: '[ConsoleInput] view switched' }
  | { type: '[ConsoleInput] view set'; viewName: ViewName }
  | { type: '[ConsoleInput] player flying toggled'; state: boolean }
  | { type: '[ConsoleInput] display level set'; level: ConsoleDisplayLevel }
  | { type: '[ConsoleInput] signed out' }
  | { type: '[CommentTextInput] changed'; value: string }
  | { type: '[CommentTextInput] submit failed due to collision' }
  | { type: '[CommentTextInput] submit failed due to empty text' }
  | { type: '[CommentTextInput] submit failed due to backend error' }
  | { type: '[CommentTextInput] started submission' }
  | { type: '[CommentTextInput] submitted'; id: string; commentEntity: CommentEntity }
  | { type: '[CommentTextInput] focused' }
  | { type: '[CommentTextInput] blurred' }
  | { type: '[CommentTextInput/bilibili] enter key down when empty' }
  | { type: '[CommentSizeInput] changed'; size: number }
  | { type: '[CommentColorInput] changed'; color: Color }
  | { type: '[VolumeInput] turned'; on: boolean }
  | { type: '[Tutorial] hinted movement keys for the first time' }
  | { type: '[Tutorial] hinted movement keys for the second time' }
  | { type: '[Tutorial] hinted movement keys for the last time' }
  | { type: '[Tutorial] hinted comment key' }
  | { type: '[shim/bilibili] external dependency ready'; $: JQueryStatic }
  | { type: 'Console entry used'; key: string; entry: ConsoleEntry }
  | { type: 'Console entry released'; key: string };
