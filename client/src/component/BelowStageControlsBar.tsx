import * as React from 'react';
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
