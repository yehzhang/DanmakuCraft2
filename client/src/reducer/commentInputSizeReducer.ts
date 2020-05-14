import { Action } from '../action';

const initialState: number = 25;

function commentInputSizeReducer(state = initialState, action: Action): number {
  switch (action.type) {
    case '[CommentSizeInput] changed': {
      const { size } = action;
      return size;
    }
    case 'Genesis':
      return initialState;
    default:
      return state;
  }
}

export default commentInputSizeReducer;
