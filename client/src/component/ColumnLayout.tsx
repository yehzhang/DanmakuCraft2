import * as React from 'react';
import { ReactNode } from 'react';
import { createStyleSheet } from '../shim/react';

interface Props {
  readonly children: ReactNode;
}

function ColumnLayout({ children }: Props) {
  return <div style={styles.container}>{children}</div>;
}

const styles = createStyleSheet({
  container: {
    display: 'flex',
    flexDirection: 'column',

    width: '100%',
    height: '100%',

    fontFamily:
      '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Arial,PingFang SC,' +
      'Hiragino Sans GB,Microsoft YaHei,sans-serif',
  },
});

export default ColumnLayout;
