import { Action } from '../action';
import { ConsoleEntries } from '../state';

const initialState: ConsoleEntries = {};

function consoleEntriesReducer(state = initialState, action: Action): ConsoleEntries {
  switch (action.type) {
    case 'Console entry used': {
      const { key, entry } = action;
      return {
        ...state,
        [key]: entry,
      };
    }
    case 'Console entry released': {
      const { key } = action;
      const { [key]: ignored, ...remainingEntries } = state;
      return remainingEntries;
    }
    default:
      return state;
  }
}

export default consoleEntriesReducer;
