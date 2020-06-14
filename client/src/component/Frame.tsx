import * as React from 'react';
import { ReactElement, useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet';
import { selectDomain } from '../shim/domain';
import { createStyleSheet } from '../shim/react';

const { default: normalizeCss } = require('normalize.css');

interface Props {
  readonly children: ReactElement;
}

function Frame(props: Props) {
  return renderContent(props);
}

const renderContent: (props: Props) => ReactElement = selectDomain({
  danmakucraft: ({ children }) => {
    return (
      <>
        <Helmet>{renderCommonStyle()}</Helmet>
        {children}
      </>
    );
  },
  bilibili: ({ children }) => {
    // Wrap the app in an iframe to fend off css corruption.
    const [element, setElement] = useState<HTMLIFrameElement | null>(null);
    const document = element?.contentDocument;
    const head = document?.head;
    const body = document?.body;
    return (
      <iframe style={styles.container} ref={setElement}>
        {head &&
          createPortal(
            <>
              <style>
                {`body {
                  margin: 0;
                }`}
              </style>
              {renderCommonStyle()}
            </>,
            head
          )}
        {body && createPortal(children, body)}
      </iframe>
    );
  },
});

function renderCommonStyle() {
  return <style>{normalizeCss}</style>;
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
