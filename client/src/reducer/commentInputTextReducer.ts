import { Action } from '../action';

const initialState: string = '';

function commentInputTextReducer(state = initialState, action: Action): string {
  switch (action.type) {
    case '[CommentTextInput] changed': {
      const { value } = action;
      return value;
    }
    case '[CommentTextInput] submitted':
    case 'Genesis':
      return initialState;
    default:
      return state;
  }
}

export default commentInputTextReducer;
