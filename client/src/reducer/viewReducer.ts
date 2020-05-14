import { Action } from '../action';
import { ViewName } from '../state';

const initialState: ViewName = 'opening';

function viewReducer(state = initialState, action: Action): ViewName {
  switch (action.type) {
    case '[Opening] completed':
      return 'main';
    case '[ConsoleInput] view switched': {
      switch (state) {
        case 'main':
          return 'opening';
        case 'opening':
          return 'main';
      }
    }
    case '[ConsoleInput] view set': {
      const { viewName } = action;
      return viewName;
    }
    case 'Genesis':
      return initialState;
    default:
      return state;
  }
}

export default viewReducer;
