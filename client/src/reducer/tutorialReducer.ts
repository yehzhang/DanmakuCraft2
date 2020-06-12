import { Action } from '../action';
import { TutorialStage, TutorialState } from '../state';

const initialState: TutorialState = {
  stage: 'preMovementKeys',
  msSinceThisStage: 0,
  moved: false,
  enterKeyPressed: false,
};

function tutorialReducer(state = initialState, action: Action): TutorialState {
  switch (action.type) {
    case '[StageBodyControl] up':
    case '[StageBodyControl] down':
    case '[StageBodyControl] left':
    case '[StageBodyControl] right':
      return {
        ...state,
        moved: true,
      };
    case '[StageBodyControl] enter':
      return {
        ...state,
        enterKeyPressed: true,
      };
    case '[Opening] completed':
      return {
        ...state,
        moved: false,
        enterKeyPressed: false,
      };
    case '[Ticker] ticked': {
      const { deltaMs } = action;
      const { msSinceThisStage } = state;
      return updateStage({
        ...state,
        msSinceThisStage: msSinceThisStage + deltaMs,
      });
    }
    default:
      return state;
  }
}

function updateStage(state: TutorialState): TutorialState {
  const { stage, msSinceThisStage, moved, enterKeyPressed } = state;
  switch (stage) {
    case 'preMovementKeys':
      return moved
        ? transitionTo('preCommentKeys', state)
        : msSinceThisStage < firstMovementKeysHintWaitMs
        ? state
        : transitionTo('firstMovementKeys', state);
    case 'firstMovementKeys':
      return moved
        ? transitionTo('preCommentKeys', state)
        : msSinceThisStage < secondMovementKeysHintWaitMs
        ? state
        : transitionTo('secondMovementKeys', state);
    case 'secondMovementKeys':
      return moved
        ? transitionTo('preCommentKeys', state)
        : msSinceThisStage < finalMovementKeysHintWaitMs
        ? state
        : transitionTo('finalMovementKeys', state);
    case 'finalMovementKeys':
      return transitionTo('preCommentKeys', state);
    case 'preCommentKeys':
      return enterKeyPressed
        ? transitionTo('end', state)
        : msSinceThisStage < commentKeyHintWaitMs
        ? state
        : transitionTo('commentKeys', state);
    case 'commentKeys':
      return transitionTo('end', state);
    case 'end':
      return state;
  }
}

const firstMovementKeysHintWaitMs = 8000;
const secondMovementKeysHintWaitMs = 7000;
const finalMovementKeysHintWaitMs = 11000;
const commentKeyHintWaitMs = __DEV__ ? 7000 : 3 * 60 * 1000;

function transitionTo(stage: TutorialStage, state: TutorialState): TutorialState {
  return {
    ...state,
    stage,
    msSinceThisStage: 0,
  };
}

export default tutorialReducer;
