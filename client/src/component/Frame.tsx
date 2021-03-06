import * as React from 'react';
import { ReactElement, useState } from 'react';
import { createPortal } from 'react-dom';
import { domain } from '../shim/domain';
import { createStyleSheet } from '../shim/react';

interface Props {
  readonly children: ReactElement;
}

function Frame({ children }: Props) {
  if (domain !== 'bilibili') {
    return children;
  }

  // Wrap the app in an iframe to fend off css corruption.
  const [element, setElement] = useState<HTMLIFrameElement | null>(null);
  const document = element?.contentDocument;
  const head = document?.head;
  const body = document?.body;
  return (
    <iframe style={styles.container} ref={setElement}>
      {head && createPortal(<IFrameStyle />, head)}
      {body && createPortal(children, body)}
    </iframe>
  );
}

function IFrameStyle() {
  return (
    <style>
      {`
        body {
          margin: 0;
        }
      `}
    </style>
  );
}

const styles = createStyleSheet({
  container: {
    width: '100%',
    height: '100%',

    border: 0,

    // Defensive defaults.
    display: 'block',
    position: 'static',
    opacity: 1,
  },
});

export default Frame;
