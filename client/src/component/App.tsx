import * as React from 'react';
import { memo } from '../shim/react';
import AuthDialog from './AuthDialog';
import BelowStageControlBar from './BelowStageControlBar';
import ColumnLayout from './ColumnLayout';
import ErrorBoundary from './ErrorBoundary';
import Frame from './Frame';
import PixiApp from './PixiApp';
import Stage from './Stage';
import StageControlOverlay from './StageControlOverlay';
import View from './View';
import VolumeInput from './VolumeInput';

function App() {
  return (
    <Frame>
      <ErrorBoundary>
        <ColumnLayout>
          <Stage>
            <View name="opening">
              <AuthDialog />
            </View>
            <View name="main">
              <StageControlOverlay />
              <VolumeInput />
            </View>
            <PixiApp />
          </Stage>
          <BelowStageControlBar />
        </ColumnLayout>
      </ErrorBoundary>
    </Frame>
  );
}

export default memo(App);
