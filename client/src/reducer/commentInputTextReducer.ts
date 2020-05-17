import { Action } from '../action';

const initialState = '';

function commentInputTextReducer(state = initialState, action: Action): string {
  switch (action.type) {
    case '[CommentTextInput] changed': {
      const { value } = action;
      return value;
    }
    case '[CommentTextInput] submitted':
      return initialState;
    default:
      return state;
  }
}

export default commentInputTextReducer;
