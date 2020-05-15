import * as React from 'react';
import ConsoleDisplay from './ConsoleDisplay';
import MainView from './MainView';
import OpeningView from './OpeningView';
import PixiStage from './PixiStage';

function Stage() {
  return (
    <PixiStage>
      <OpeningView />
      <MainView />
      {__DEV__ && <ConsoleDisplay />}
    </PixiStage>
  );
}

export default Stage;
