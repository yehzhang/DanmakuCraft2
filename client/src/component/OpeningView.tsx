import * as React from 'react';
import { black } from '../data/color';
import FullscreenColor from './FullscreenColor';
import Opening from './Opening';
import View from './View';

function OpeningView() {
  return (
    <View name="opening">
      <FullscreenColor color={black} />
      <Opening />
    </View>
  );
}

export default OpeningView;
