import { Action } from '../action';
import { VolumeState } from '../state';

const initialState: VolumeState = 1;

function volumeReducer(state = initialState, action: Action): VolumeState {
  switch (action.type) {
    case '[VolumeInput] turned': {
      const { on } = action;
      return on ? 1 : 0;
    }
    default:
      return state;
  }
}

export default volumeReducer;
