import * as React from 'react';
import { memo } from '../shim/react';
import AuthDialog from './AuthDialog';
import BelowStageControlBar from './BelowStageControlBar';
import ColumnLayout from './ColumnLayout';
import ErrorBoundary from './ErrorBoundary';
import Frame from './Frame';
import PixiView from './PixiView';
import Stage from './Stage';
import StageControl from './StageControl';
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
              <VolumeInput />
            </View>
            <StageControl>
              <PixiView />
            </StageControl>
          </Stage>
          <BelowStageControlBar />
        </ColumnLayout>
      </ErrorBoundary>
    </Frame>
  );
}

export default memo(App);
