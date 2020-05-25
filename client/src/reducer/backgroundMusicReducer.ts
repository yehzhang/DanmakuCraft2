import { Action } from '../action';
import { BackgroundMusicState } from '../state';

const initialState: BackgroundMusicState = null;

function backgroundMusicReducer(state = initialState, action: Action): BackgroundMusicState {
  switch (action.type) {
    case '[index] background music created': {
      const { album } = action;
      return album;
    }
    default:
      return state;
  }
}

export default backgroundMusicReducer;
