import { render } from '@inlet/react-pixi';
import * as React from 'react';
import { isValidElement, ReactElement, useEffect, useRef } from 'react';
import { Provider, useStore } from 'react-redux';
import { selectDomain } from '../shim/domain';
import application, { setRendererView } from '../shim/pixi/application';
import { createStyleSheet } from '../shim/react';
import { useSelector } from '../shim/redux';

interface Props {
  readonly children: readonly (ReactElement | false)[];
}

function PixiStage({ children }: Props) {
  const elementRef = useRef<HTMLCanvasElement>(null);
  const store = useStore();
  useEffect(() => {
    if (!elementRef.current) {
      return;
    }
    setRendererView(elementRef.current);
    render(<Provider store={store}>{children.filter(isValidElement)}</Provider>, application.stage);
  }, []);

  const containerSize = useSelector((state) => state.containerSize);
  useEffect(() => {
    const { x, y } = containerSize;
    application.renderer.resize(x, y);
  }, [containerSize]);

  return <canvas ref={elementRef} style={styles.canvas} />;
}

const styles = createStyleSheet({
  canvas: {
    boxShadow: selectDomain({
      danmakucraft: '0 3px 6px rgba(0, 0, 0, 0.05), 0 3px 6px rgba(0, 0, 0, 0.05)',
    }),
    // Make height compatible with parent.
    display: 'flex',
  },
});

export default PixiStage;
