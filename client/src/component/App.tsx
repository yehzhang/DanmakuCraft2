import * as React from 'react';
import { Provider } from 'react-redux';
import { black } from '../data/color';
import { memo } from '../shim/react';
import store from '../store';
import BackgroundMusic from './BackgroundMusic';
import BelowStageControlsBar from './BelowStageControlsBar';
import Camera from './Camera';
import Chest from './Chest';
import ColumnLayout from './ColumnLayout';
import CommentColorInput from './CommentColorInput';
import CommentInputPreview from './CommentInputPreview';
import CommentSizeInput from './CommentSizeInput';
import CommentTextInput from './CommentTextInput';
import ConsoleDisplay from './ConsoleDisplay';
import CulledComments from './CulledComments';
import CulledSigns from './CulledSigns';
import EnvironmentAwareFullscreenColor from './EnvironmentAwareFullscreenColor';
import Frame from './Frame';
import FullscreenColor from './FullscreenColor';
import LayoutSizeDetector from './LayoutSizeDetector';
import MainViewFadeIn from './MainViewFadeIn';
import Opening from './Opening';
import PixiStage from './PixiStage';
import SpeechBubble from './SpeechBubble';
import StageControls from './StageControls';
import Ticker from './Ticker';
import TinyTelevision from './TinyTelevision';
import Tutorial from './Tutorial';
import View from './View';
import VolumeInput from './VolumeInput';

function App() {
  return (
    <Frame>
      <Provider store={store}>
        <ColumnLayout>
          <LayoutSizeDetector>
            <StageControls>
              <PixiStage>
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
              </PixiStage>
            </StageControls>
          </LayoutSizeDetector>
          <View name="main">
            <VolumeInput />
          </View>
          <BelowStageControlsBar>
            <CommentSizeInput />
            <CommentColorInput />
            <CommentTextInput />
          </BelowStageControlsBar>
        </ColumnLayout>
      </Provider>
    </Frame>
  );
}

export default memo(App);
