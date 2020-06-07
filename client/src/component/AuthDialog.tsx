import * as React from 'react';
import { useEffect, useState } from 'react';
import useTimerState from '../hook/useTimerState';
import { createStyleSheet } from '../shim/react';
import { useSelector } from '../shim/redux';
import EmailAuthForm from './EmailAuthForm';

function AuthDialog() {
  const sessionToken = useSelector((state) => state.user?.sessionToken);
  const [authRequired, setAuthRequired] = useState(false);
  useEffect(() => {
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
    // TODO verify validity and set authRequired if not valid, clearing session token.
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
