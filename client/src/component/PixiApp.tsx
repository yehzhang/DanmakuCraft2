import * as React from 'react';
import { black } from '../data/color';
import BackgroundMusic from './BackgroundMusic';
import Camera from './Camera';
import Chest from './Chest';
import CommentInputPreview from './CommentInputPreview';
import ConsoleDisplay from './ConsoleDisplay';
import CulledComments from './CulledComments';
import CulledSigns from './CulledSigns';
import EnvironmentAwareFullscreenColor from './EnvironmentAwareFullscreenColor';
import FullscreenColor from './FullscreenColor';
import MainViewFadeIn from './MainViewFadeIn';
import Opening from './Opening';
import PixiCanvas from './PixiCanvas';
import SpeechBubble from './SpeechBubble';
import Ticker from './Ticker';
import TinyTelevision from './TinyTelevision';
import Tutorial from './Tutorial';
import View from './View';

function PixiApp() {
  return (
    <PixiCanvas>
      <View name="opening">
        <FullscreenColor color={black} />
        <Opening />
      </View>
      <View name="main">
        <Ticker />
        <BackgroundMusic />
        <Tutorial />
        <EnvironmentAwareFullscreenColor />
        <Camera>
          <CulledSigns />
          <Chest />
          <TinyTelevision />
          <CommentInputPreview />
          <CulledComments />
          <SpeechBubble />
        </Camera>
        <MainViewFadeIn />
      </View>
      {__DEV__ && <ConsoleDisplay />}
    </PixiCanvas>
  );
}

export default PixiApp;
