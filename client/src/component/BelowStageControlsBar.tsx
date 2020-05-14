import * as React from 'react';
import { ReactNode } from 'react';
import { selectDomain } from '../shim/domain';
import { createStyleSheet } from '../shim/react';

interface Props {
  readonly children: ReactNode;
}

function BelowStageControlsBar({ children }: Props) {
  return <div style={styles.container}>{children}</div>;
}

const styles = createStyleSheet({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: selectDomain({
      danmakucraft: '10px 0',
    }),
  },
});

export default BelowStageControlsBar;
