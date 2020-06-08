import { Action } from '../action';
import { UserState } from '../state';

const initialState: UserState | null = null;

function userReducer(state = initialState, action: Action): UserState | null {
  switch (action.type) {
    case '[EmailAuthForm] signed up':
    case '[EmailAuthForm] signed in': {
      const { sessionToken } = action;
      return { sessionToken };
    }
    case '[AuthDialog] invalid session token':
    case '[ConsoleInput] signed out':
      return initialState;
    default:
      return state;
  }
}

export default userReducer;
