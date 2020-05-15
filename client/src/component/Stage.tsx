import * as React from 'react';
import ConsoleDisplay from './ConsoleDisplay';
import LayoutSizeDetector from './LayoutSizeDetector';
import MainView from './MainView';
import OpeningView from './OpeningView';
import PixiStage from './PixiStage';
import StageControls from './StageControls';
import View from './View';
import VolumeInput from './VolumeInput';

function Stage() {
  return (
    <div>
      <LayoutSizeDetector>
        <StageControls>
          <PixiStage>
            <OpeningView />
            <MainView />
            {__DEV__ && <ConsoleDisplay />}
          </PixiStage>
        </StageControls>
      </LayoutSizeDetector>
      <View name="main">
        <VolumeInput />
      </View>
    </div>
  );
}

export default Stage;
