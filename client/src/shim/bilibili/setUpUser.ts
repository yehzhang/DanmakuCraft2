import Cookies from 'js-cookie';
import { addLoadingTask, LoadingResult } from '../../component/Loading';
import track from '../logging/track';
import { Store } from '../redux';

function setUpUser(store: Store): LoadingResult {
  addLoadingTask(() => {
    const signedOutElement = document.querySelector('.nav-user-center .user-con.logout');
    if (signedOutElement) {
      trackUserSignInState('signed out');
      return 'bilibiliNotSignedIn';
    }

    const userId = Cookies.get('DedeUserID') || null;
    trackUserSignInState(userId ? 'signed in' : 'unknown');

    store.dispatch({ type: '[shim/bilibili] detected maybe signed-in user', userId });
  });
}

function trackUserSignInState(type: 'signed in' | 'signed out' | 'unknown') {
  track('Bilibili User Setup', { type });
}

export default setUpUser;
