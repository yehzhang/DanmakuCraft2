import * as React from 'react';
import ConsoleDisplay from './ConsoleDisplay';
import MainView from './MainView';
import OpeningView from './OpeningView';
import PixiCanvas from './PixiCanvas';

function PixiApp() {
  return (
    <PixiCanvas>
      <OpeningView />
      <MainView />
      {__DEV__ && <ConsoleDisplay />}
    </PixiCanvas>
  );
}

export default PixiApp;
