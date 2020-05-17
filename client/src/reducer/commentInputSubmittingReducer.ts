import { Action } from '../action';

const initialState = false;

function commentInputSubmittingReducer(state = initialState, action: Action): boolean {
  switch (action.type) {
    case '[CommentTextInput] started submission':
      return true;
    case '[CommentTextInput] submitted':
    case '[CommentTextInput] submit failed due to network error':
      return false;
    default:
      return state;
  }
}

export default commentInputSubmittingReducer;
