import * as React from 'react';
import ConsoleDisplay from './ConsoleDisplay';
import MainView from './MainView';
import OpeningView from './OpeningView';
import PixiApplication from './PixiApplication';

function Stage() {
  return (
    <PixiApplication>
      <OpeningView />
      <MainView />
      {__DEV__ && <ConsoleDisplay />}
    </PixiApplication>
  );
}

export default Stage;
