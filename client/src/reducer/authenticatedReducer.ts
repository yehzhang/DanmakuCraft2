import { Action } from '../action';

const initialState = false;

function authenticatedReducer(state = initialState, action: Action): boolean {
  switch (action.type) {
    case '[EmailAuthForm] signed in':
    case '[EmailAuthForm] signed up':
    case '[AuthDialog] valid session token':
      return true;
    default:
      return state;
  }
}

export default authenticatedReducer;
