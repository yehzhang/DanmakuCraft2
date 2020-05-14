import {
  FlatCommentDataRequest,
  FlatCommentDataResponse,
} from '../../server/api/services/FlatCommentData';
import { Color } from './data/color';
import { Buff, SignEntity } from './data/entity';
import { Point } from './data/point';
import { ConsoleDisplayLevel, ConsoleEntry, State, ViewName } from './state';

export type Action =
  | { type: '[StageControls] up'; keyDown: boolean }
  | { type: '[StageControls] down'; keyDown: boolean }
  | { type: '[StageControls] left'; keyDown: boolean }
  | { type: '[StageControls] right'; keyDown: boolean }
  | { type: '[StageControls] enter'; keyDown: boolean; view: ViewName }
  | { type: '[StageControls] focused' }
  | { type: '[StageControls] blurred' }
  | { type: '[StageControls] context menu opened' }
  | { type: '[LayoutSizeDetector] resized'; size: Point }
  | { type: '[Ticker] ticked'; deltaMs: number; state: State }
  | { type: '[Chest] opened by player'; buff: Buff }
  | { type: '[SpeechBubble] display expired' }
  | { type: 'Genesis'; spawnPosition: Point; signEntities: readonly SignEntity[] }
  | { type: 'Comments loaded from backend'; data: readonly FlatCommentDataResponse[] }
  | { type: '[Opening] completed' }
  | { type: '[ConsoleInput] chest wanted'; position: Point; lootType: Buff['type'] }
  | { type: '[ConsoleInput] comment wanted'; position: Point; text: string; color: Color }
  | { type: '[ConsoleInput] chromatic comment wanted'; position: Point; text: string }
  | { type: '[ConsoleInput] notification pushed'; text: string }
  | { type: '[ConsoleInput] view switched' }
  | { type: '[ConsoleInput] view set'; viewName: ViewName }
  | { type: '[ConsoleInput] player flying toggled'; state: boolean }
  | { type: '[ConsoleInput] display level set'; level: ConsoleDisplayLevel }
  | { type: '[CommentTextInput] changed'; value: string }
  | { type: '[CommentTextInput] submit failed due to collision' }
  | { type: '[CommentTextInput] submit failed due to empty text' }
  | { type: '[CommentTextInput] submit failed due to network error' }
  | { type: '[CommentTextInput] started submission' }
  | { type: '[CommentTextInput] submitted'; data: FlatCommentDataRequest }
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
  | { type: '[shim/bilibili] detected maybe signed-in user'; userId: string | null }
  | { type: '[shim/bilibili] external dependency ready'; $: JQueryStatic }
  | { type: '[TEST] signed in' }
  | { type: 'Console entry used'; key: string; entry: ConsoleEntry }
  | { type: 'Console entry released'; key: string };
