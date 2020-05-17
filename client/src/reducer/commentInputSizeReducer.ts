import { Action } from '../action';

const initialState = 25;

function commentInputSizeReducer(state = initialState, action: Action): number {
  switch (action.type) {
    case '[CommentSizeInput] changed': {
      const { size } = action;
      return size;
    }
    default:
      return state;
  }
}

export default commentInputSizeReducer;
