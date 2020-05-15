import * as React from 'react';
import { Provider } from 'react-redux';
import { memo } from '../shim/react';
import store from '../store';
import BelowStageControlsBar from './BelowStageControlsBar';
import ColumnLayout from './ColumnLayout';
import Frame from './Frame';
import Stage from './Stage';
import View from './View';
import VolumeInput from './VolumeInput';

function App() {
  return (
    <Frame>
      <Provider store={store}>
        <ColumnLayout>
          <Stage />
          <View name="main">
            <VolumeInput />
          </View>
          <BelowStageControlsBar />
        </ColumnLayout>
      </Provider>
    </Frame>
  );
}

export default memo(App);
