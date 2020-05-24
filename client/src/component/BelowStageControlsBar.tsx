import * as React from 'react';
import { CSSProperties } from 'react';
import { selectDomain } from '../shim/domain';
import { createStyleSheet } from '../shim/react';
import CommentColorInput from './CommentColorInput';
import CommentSizeInput from './CommentSizeInput';
import CommentTextInput from './CommentTextInput';

function BelowStageControlsBar() {
  return (
    <div style={styles.container}>
      <CommentSizeInput />
      <CommentColorInput />
      <CommentTextInput />
    </div>
  );
}

const styles = createStyleSheet({
  container: selectDomain<CSSProperties>({
    danmakucraft: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '10px 0',
    },
    bilibili: {
      display: 'none',
    },
  }),
});

export default BelowStageControlsBar;
