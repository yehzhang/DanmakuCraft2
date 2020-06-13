import { Action } from '../action';
import { MovementState } from '../state';

const initialState: MovementState = {
  up: 0,
  down: 0,
  left: 0,
  right: 0,
};

function movementReducer(state = initialState, action: Action): MovementState {
  switch (action.type) {
    case '[StageControlOverlay] up': {
      const { keyDown } = action;
      return {
        ...state,
        up: keyDown ? 1 : 0,
      };
    }
    case '[StageControlOverlay] down': {
      const { keyDown } = action;
      return {
        ...state,
        down: keyDown ? 1 : 0,
      };
    }
    case '[StageControlOverlay] left': {
      const { keyDown } = action;
      return {
        ...state,
        left: keyDown ? 1 : 0,
      };
    }
    case '[StageControlOverlay] right': {
      const { keyDown } = action;
      return {
        ...state,
        right: keyDown ? 1 : 0,
      };
    }
    case '[StageControlOverlay] dragged': {
      const {
        startOffsetRatio: { x, y },
      } = action;
      return {
        up: Math.max(-y, 0),
        down: Math.max(y, 0),
        left: Math.max(-x, 0),
        right: Math.max(x, 0),
      };
    }
    case '[StageControlOverlay] blurred':
    case '[StageControlOverlay] context menu opened':
    case '[StageControlOverlay] drag ended':
    case '[Opening] genesis':
      return initialState;
    default:
      return state;
  }
}

export default movementReducer;
