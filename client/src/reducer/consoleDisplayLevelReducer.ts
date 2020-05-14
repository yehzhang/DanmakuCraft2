import { Action } from '../action';
import { ConsoleDisplayLevel } from '../state';

const initialState: ConsoleDisplayLevel = 'info';

function consoleDisplayLevelReducer(state = initialState, action: Action): ConsoleDisplayLevel {
  switch (action.type) {
    case '[ConsoleInput] display level set': {
      const { level } = action;
      return level;
    }
    default:
      return state;
  }
}

export default consoleDisplayLevelReducer;
