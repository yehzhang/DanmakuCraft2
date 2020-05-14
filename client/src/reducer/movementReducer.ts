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
    case '[StageControls] up': {
      const { keyDown } = action;
      return {
        ...state,
        up: keyDown,
      };
    }
    case '[StageControls] down': {
      const { keyDown } = action;
      return {
        ...state,
        down: keyDown,
      };
    }
    case '[StageControls] left': {
      const { keyDown } = action;
      return {
        ...state,
        left: keyDown,
      };
    }
    case '[StageControls] right': {
      const { keyDown } = action;
      return {
        ...state,
        right: keyDown,
      };
    }
    case '[StageControls] blurred':
    case '[StageControls] context menu opened':
    case 'Genesis':
      return initialState;
    default:
      return state;
  }
}

export default movementReducer;
