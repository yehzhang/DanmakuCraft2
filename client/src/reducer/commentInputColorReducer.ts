import { Action } from '../action';
import { Color, white } from '../data/color';

const initialState: Color = white;

function commentInputColorReducer(state = initialState, action: Action): Color {
  switch (action.type) {
    case '[CommentColorInput] changed': {
      const { color } = action;
      return color;
    }
    default:
      return state;
  }
}

export default commentInputColorReducer;
