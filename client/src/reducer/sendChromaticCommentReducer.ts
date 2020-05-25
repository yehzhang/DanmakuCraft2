import { Action } from '../action';

const initialState = false;

function sendChromaticCommentReducer(state = initialState, action: Action): boolean {
  switch (action.type) {
    case '[Chest] opened by player': {
      const { buff } = action;
      return state || buff.type === 'chromatic';
    }
    case '[CommentTextInput] submitted':
      return false;
    case '[Opening] genesis':
      return initialState;
    default:
      return state;
  }
}

export default sendChromaticCommentReducer;
