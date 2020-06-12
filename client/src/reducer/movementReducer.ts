import { Action } from '../action';
import { MovementState } from '../state';

const initialState: MovementState = {
  up: false,
  down: false,
  left: false,
  right: false,
};

function movementReducer(state = initialState, action: Action): MovementState {
  switch (action.type) {
    case '[StageBodyControl] up': {
      const { keyDown } = action;
      return {
        ...state,
        up: keyDown,
      };
    }
    case '[StageBodyControl] down': {
      const { keyDown } = action;
      return {
        ...state,
        down: keyDown,
      };
    }
    case '[StageBodyControl] left': {
      const { keyDown } = action;
      return {
        ...state,
        left: keyDown,
      };
    }
    case '[StageBodyControl] right': {
      const { keyDown } = action;
      return {
        ...state,
        right: keyDown,
      };
    }
    case '[StageBodyControl] blurred':
    case '[StageBodyControl] context menu opened':
    case '[Opening] genesis':
      return initialState;
    default:
      return state;
  }
}

export default movementReducer;
