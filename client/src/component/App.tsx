import * as React from 'react';
import { memo } from '../shim/react';
import BelowStageControlsBar from './BelowStageControlsBar';
import ColumnLayout from './ColumnLayout';
import ErrorBoundary from './ErrorBoundary';
import Frame from './Frame';
import LayoutSizeDetector from './LayoutSizeDetector';
import Stage from './Stage';
import View from './View';
import VolumeInput from './VolumeInput';

function App() {
  return (
    <Frame>
      <ErrorBoundary>
        <ColumnLayout>
          <LayoutSizeDetector>
            <Stage />
          </LayoutSizeDetector>
          <View name="main">
            <VolumeInput />
          </View>
          <BelowStageControlsBar />
        </ColumnLayout>
      </ErrorBoundary>
    </Frame>
  );
}

export default memo(App);
