import Cookies from 'js-cookie';
import track from '../logging/track';

function setUpUser() {
  const signedOutElement = document.querySelector('.nav-user-center .user-con.logout');
  if (signedOutElement) {
    trackUserSignInState('signed out');
    return;
  }

  const userId = Cookies.get('DedeUserID') || null;
  trackUserSignInState(userId ? 'signed in' : 'unknown');
}

function trackUserSignInState(type: 'signed in' | 'signed out' | 'unknown') {
  track('Bilibili User Setup', { type });
}

export default setUpUser;
