import { Action } from '../action';
import { ReceivedCommentEntityState } from '../state';

const initialState: ReceivedCommentEntityState = {};

function receivedCommentEntitiesReducer(
  state = initialState,
  action: Action
): ReceivedCommentEntityState {
  switch (action.type) {
    case '[CommentTextInput] submitted':
    case '[ConsoleInput] chromatic comment wanted':
    case '[ConsoleInput] comment wanted': {
      const { id } = action;
      return {
        ...state,
        [id]: new Date(),
      };
    }
    case '[Opening] genesis':
      return initialState;
    default:
      return state;
  }
}

export default receivedCommentEntitiesReducer;
