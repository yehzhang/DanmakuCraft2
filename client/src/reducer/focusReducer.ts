import { Action } from '../action';
import { FocusTarget } from '../state';

const initialState: FocusTarget | null = null;

function focusReducer(state = initialState, action: Action): FocusTarget | null {
  switch (action.type) {
    case '[PixiStage] focused':
    case '[CommentTextInput/bilibili] enter key down when empty':
      return 'stage';
    case '[CommentTextInput] focused':
      return 'comment_input';
    case '[CommentTextInput] started submission':
    case '[CommentTextInput] submitted':
    case '[CommentTextInput] submit failed due to empty text':
    case '[CommentTextInput] submit failed due to collision':
      return state === 'comment_input' ? 'stage' : state;
    case '[PixiStage] enter': {
      const { keyDown, view, commentInputSubmitting } = action;
      return view === 'main' && state === 'stage' && keyDown && !commentInputSubmitting
        ? 'comment_input'
        : state;
    }
    case '[PixiStage] blurred':
      return state === 'stage' ? null : state;
    case '[CommentTextInput] blurred':
      return state === 'comment_input' ? null : state;
    default:
      return state;
  }
}

export default focusReducer;
