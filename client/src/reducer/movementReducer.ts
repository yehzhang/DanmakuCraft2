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
    case '[PixiStage] up': {
      const { keyDown } = action;
      return {
        ...state,
        up: keyDown,
      };
    }
    case '[PixiStage] down': {
      const { keyDown } = action;
      return {
        ...state,
        down: keyDown,
      };
    }
    case '[PixiStage] left': {
      const { keyDown } = action;
      return {
        ...state,
        left: keyDown,
      };
    }
    case '[PixiStage] right': {
      const { keyDown } = action;
      return {
        ...state,
        right: keyDown,
      };
    }
    case '[PixiStage] blurred':
    case '[PixiStage] context menu opened':
    case 'Genesis':
      return initialState;
    default:
      return state;
  }
}

export default movementReducer;
