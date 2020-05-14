import Cookies from 'js-cookie';
import { addLoadingTask, LoadingResult } from '../../component/Loading';
import { Store } from '../redux';

function setUpUser(store: Store): LoadingResult {
  addLoadingTask(() => setupSignedInUser(store));
}

function setupSignedInUser(store: Store): LoadingResult {
  const signedOutElement = document.querySelector('.nav-user-center .user-con.logout');
  if (signedOutElement) {
    return 'bilibiliNotSignedIn';
  }

  const userId = Cookies.get('DedeUserID') || null;
  store.dispatch({ type: '[shim/bilibili] detected maybe signed-in user', userId });
}

export default setUpUser;
