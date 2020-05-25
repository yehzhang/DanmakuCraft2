import { Color } from './data/color';
import { Buff, CommentEntity, SignEntity } from './data/entity';
import { Point } from './data/point';
import { ConsoleDisplayLevel, ConsoleEntry, State, ViewName } from './state';

export type Action =
  | { type: '[PixiStage] up'; keyDown: boolean }
  | { type: '[PixiStage] down'; keyDown: boolean }
  | { type: '[PixiStage] left'; keyDown: boolean }
  | { type: '[PixiStage] right'; keyDown: boolean }
  | { type: '[PixiStage] enter'; keyDown: boolean; view: ViewName }
  | { type: '[PixiStage] focused' }
  | { type: '[PixiStage] blurred' }
  | { type: '[PixiStage] context menu opened' }
  | { type: '[LayoutSizeDetector] resized'; size: Point }
  | { type: '[Ticker] ticked'; deltaMs: number; state: State }
  | { type: '[Chest] opened by player'; buff: Buff }
  | { type: '[SpeechBubble] display expired' }
  | { type: '[Opening] Genesis'; spawnPosition: Point; signEntities: readonly SignEntity[] }
  | { type: '[index] Comments loaded from backend'; data: readonly CommentEntity[] }
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
  | { type: '[CommentTextInput] submitted'; data: CommentEntity }
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
  | { type: 'Console entry used'; key: string; entry: ConsoleEntry }
  | { type: 'Console entry released'; key: string };
