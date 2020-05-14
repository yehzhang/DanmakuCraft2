import { Action } from '../action';
import { VolumeState } from '../state';

const initialState: VolumeState = 1;

function volumeReducer(state = initialState, action: Action): VolumeState {
  switch (action.type) {
    case '[VolumeInput] turned': {
      const { on } = action;
      return on ? 1 : 0;
    }
    case 'Genesis':
      return initialState;
    default:
      return state;
  }
}

export default volumeReducer;
