import * as React from 'react';
import BackgroundMusic from './BackgroundMusic';
import Camera from './Camera';
import Chest from './Chest';
import CommentInputPreview from './CommentInputPreview';
import CulledComments from './CulledComments';
import CulledSigns from './CulledSigns';
import EnvironmentAwareFullscreenColor from './EnvironmentAwareFullscreenColor';
import MainViewFadeIn from './MainViewFadeIn';
import SpeechBubble from './SpeechBubble';
import Ticker from './Ticker';
import TinyTelevision from './TinyTelevision';
import Tutorial from './Tutorial';
import View from './View';

function MainView() {
  return (
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
  );
}

export default MainView;
