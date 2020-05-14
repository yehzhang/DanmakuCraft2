import { Action } from '../action';
import { UserState } from '../state';

const initialState: UserState | null = null;

function userReducer(state = initialState, action: Action): UserState | null {
  switch (action.type) {
    case '[shim/bilibili] detected maybe signed-in user': {
      const { userId } = action;
      return {
        id: userId,
      };
    }
    case '[TEST] signed in':
      return {
        id: null,
      };
    default:
      return state;
  }
}

export default userReducer;
