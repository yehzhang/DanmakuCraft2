import * as React from 'react';
import { useEffect, useState } from 'react';
import useTimerState from '../hook/useTimerState';
import fetchBackend from '../shim/backend/fetchBackend';
import { createStyleSheet } from '../shim/react';
import { useDispatch, useSelector } from '../shim/redux';
import EmailAuthForm from './EmailAuthForm';

function AuthDialog() {
  const dispatch = useDispatch();
  const sessionToken = useSelector((state) => state.user?.sessionToken);
  const [authRequired, setAuthRequired] = useState(false);
  useEffect(() => {
    async function checkAuth() {
      if (authRequired) {
        if (sessionToken) {
          setAuthRequired(false);
        }
        return;
      }
      if (!sessionToken) {
        setAuthRequired(true);
        return;
      }
      const result = await fetchBackend('users/me', 'GET', { type: 'sessionToken', sessionToken });
      if (result.type === 'rejected') {
        dispatch({ type: '[AuthDialog] invalid session token' });
        setAuthRequired(true);
        return;
      }
      dispatch({ type: '[AuthDialog] valid session token' });
    }

    checkAuth();
  }, [sessionToken]);

  const enabled = useTimerState((elapsedMs) => elapsedMs >= 2500 && authRequired, false, []);
  return (
    <div
      style={{
        ...styles.container,
        visibility: enabled ? 'visible' : 'hidden',
        opacity: enabled ? 1 : 0,
      }}
    >
      <EmailAuthForm />
    </div>
  );
}

const styles = createStyleSheet({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    transitionProperty: 'opacity',
    transitionTimingFunction: 'ease-in-out',
    transitionDuration: '0.5s',
  },
});

export default AuthDialog;
