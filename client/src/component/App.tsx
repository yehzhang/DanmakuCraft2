import * as React from 'react';
import { Provider } from 'react-redux';
import { memo } from '../shim/react';
import store from '../store';
import BelowStageControlsBar from './BelowStageControlsBar';
import ColumnLayout from './ColumnLayout';
import Frame from './Frame';
import Stage from './Stage';

function App() {
  return (
    <Frame>
      <Provider store={store}>
        <ColumnLayout>
          <Stage />
          <BelowStageControlsBar />
        </ColumnLayout>
      </Provider>
    </Frame>
  );
}

export default memo(App);
