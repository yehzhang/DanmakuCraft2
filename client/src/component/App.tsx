import * as React from 'react';
import { memo } from '../shim/react';
import BelowStageControlsBar from './BelowStageControlsBar';
import ColumnLayout from './ColumnLayout';
import Frame from './Frame';
import LayoutSizeDetector from './LayoutSizeDetector';
import Stage from './Stage';
import View from './View';
import VolumeInput from './VolumeInput';

function App() {
  return (
    <Frame>
      <ColumnLayout>
        <LayoutSizeDetector>
          <Stage />
        </LayoutSizeDetector>
        <View name="main">
          <VolumeInput />
        </View>
        <BelowStageControlsBar />
      </ColumnLayout>
    </Frame>
  );
}

export default memo(App);
