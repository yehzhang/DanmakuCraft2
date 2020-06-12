import { render } from '@inlet/react-pixi';
import * as React from 'react';
import { isValidElement, ReactElement, useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { selectDomain } from '../shim/domain';
import application, { setRendererView } from '../shim/pixi/application';
import { createStyleSheet } from '../shim/react';
import { useStore } from '../shim/redux';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  readonly children: readonly (ReactElement | false)[];
}

function PixiCanvas({ children }: Props) {
  const elementRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (elementRef.current) {
      setRendererView(elementRef.current);
    }
  }, []);

  const store = useStore();
  useEffect(() => {
    render(
      <Provider store={store}>
        <ErrorBoundary>{children.filter(isValidElement)}</ErrorBoundary>
      </Provider>,
      application.stage
    );
  }, [store, children]);

  return <canvas ref={elementRef} style={styles.canvas} />;
}

const styles = createStyleSheet({
  canvas: {
    boxShadow: selectDomain({
      danmakucraft: '0 3px 6px rgba(0, 0, 0, 0.05), 0 3px 6px rgba(0, 0, 0, 0.05)',
    }),
    borderRadius: selectDomain({
      danmakucraft: 2,
    }),
  },
});

export default PixiCanvas;
