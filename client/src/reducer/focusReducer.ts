import { Action } from '../action';
import { FocusTarget } from '../state';

const initialState: FocusTarget | null = null;

function focusReducer(state = initialState, action: Action): FocusTarget | null {
  switch (action.type) {
    case '[StageControls] focused':
    case '[CommentTextInput] submitted':
    case '[CommentTextInput] submit failed due to empty text':
    case '[CommentTextInput] submit failed due to collision':
    case '[CommentTextInput/bilibili] enter key down when empty':
      return 'stage';
    case '[StageControls] enter': {
      const { keyDown, view } = action;
      return view === 'main' && state === 'stage' && keyDown ? 'comment_input' : state;
    }
    case '[StageControls] blurred':
      return null;
    case '[CommentTextInput] focused':
      return 'comment_input';
    case '[CommentTextInput] blurred':
      return null;
    case 'Genesis':
      return initialState;
    default:
      return state;
  }
}

export default focusReducer;
