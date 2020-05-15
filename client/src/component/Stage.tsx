import * as React from 'react';
import ConsoleDisplay from './ConsoleDisplay';
import LayoutSizeDetector from './LayoutSizeDetector';
import MainView from './MainView';
import OpeningView from './OpeningView';
import PixiStage from './PixiStage';

function Stage() {
  return (
    <LayoutSizeDetector>
      <PixiStage>
        <OpeningView />
        <MainView />
        {__DEV__ && <ConsoleDisplay />}
      </PixiStage>
    </LayoutSizeDetector>
  );
}

export default Stage;
