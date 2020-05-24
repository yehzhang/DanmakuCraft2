import { combineReducers } from 'redux';
import { Action } from '../action';
import { State } from '../state';
import backgroundMusicReducer from './backgroundMusicReducer';
import cameraPositionReducer from './cameraPositionReducer';
import chestReducer from './chestReducer';
import commentEntitiesReducer from './commentEntitiesReducer';
import commentInputColorReducer from './commentInputColorReducer';
import commentInputSizeReducer from './commentInputSizeReducer';
import commentInputSubmittingReducer from './commentInputSubmittingReducer';
import commentInputTextReducer from './commentInputTextReducer';
import consoleDisplayLevelReducer from './consoleDisplayLevelReducer';
import consoleEntriesReducer from './consoleEntriesReducer';
import containerSizeReducer from './containerSizeReducer';
import domainReducer from './domainReducer';
import focusReducer from './focusReducer';
import hastyRemainingMsReducer from './hastyRemainingMsReducer';
import movementReducer from './movementReducer';
import notificationReducer from './notificationReducer';
import playerReducer from './playerReducer';
import receivedCommentEntitiesReducer from './receivedCommentEntitiesReducer';
import sendChromaticCommentReducer from './sendChromaticCommentReducer';
import signEntitiesReducer from './signEntitiesReducer';
import tutorialReducer from './tutorialReducer';
import viewReducer from './viewReducer';
import volumeReducer from './volumeReducer';

const reducer = combineReducers<State, Action>({
  movement: movementReducer,
  player: playerReducer,
  hastyRemainingMs: hastyRemainingMsReducer,
  cameraPosition: cameraPositionReducer,
  chest: chestReducer,
  commentEntities: commentEntitiesReducer,
  containerSize: containerSizeReducer,
  signEntities: signEntitiesReducer,
  notification: notificationReducer,
  consoleEntries: consoleEntriesReducer,
  consoleDisplayLevel: consoleDisplayLevelReducer,
  focus: focusReducer,
  commentInputText: commentInputTextReducer,
  commentInputSize: commentInputSizeReducer,
  commentInputColor: commentInputColorReducer,
  commentInputSubmitting: commentInputSubmittingReducer,
  view: viewReducer,
  volume: volumeReducer,
  sendChromaticComment: sendChromaticCommentReducer,
  tutorial: tutorialReducer,
  domain: domainReducer,
  backgroundMusic: backgroundMusicReducer,
  receivedCommentEntities: receivedCommentEntitiesReducer,
});

export default reducer;
