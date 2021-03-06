import useComponentSize from '@rehooks/component-size';
import * as React from 'react';
import { ReactNode, useEffect, useRef } from 'react';
import application from '../shim/pixi/application';
import { createStyleSheet } from '../shim/react';
import { useDispatch } from '../shim/redux';

interface Props {
  children: ReactNode;
}

function LayoutSizeDetector({ children }: Props) {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const { width, height } = useComponentSize(containerRef);
  useEffect(() => {
    application.renderer.resize(width, height);
    dispatch({ type: '[LayoutSizeDetector] resized', size: { x: width, y: height } });
  }, [dispatch, width, height]);

  return (
    <div ref={containerRef} style={styles.container}>
      {children}
    </div>
  );
}

const styles = createStyleSheet({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
});

export default LayoutSizeDetector;
