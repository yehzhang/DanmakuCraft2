import * as React from 'react';
import { useCallback, useReducer } from 'react';
import { bottomRight } from '../data/anchors';
import { black, white } from '../data/color';
import { useDispatch, useSelector } from '../shim/redux';
import DanmakuParticleField from './DanmakuParticleField';
import DanmakuPlanet from './DanmakuPlanet';
import Loading from './Loading';
import OpeningFadeOut from './OpeningFadeOut';
import OpeningTitle from './OpeningTitle';

function Opening() {
  const [state, dispatch] = useReducer(reducer, {
    stage: 'entering',
    titleEntered: false,
    planetEntered: false,
  });
  const { x: width, y: height } = useSelector((state_) => state_.containerSize);
  const vanishingPoint = { x: width * 0.5, y: height * 0.5 };
  const successfulExiting = state.stage === 'exiting_successful';
  const storeDispatch = useDispatch();
  const onComplete = useCallback(() => {
    if (successfulExiting) {
      storeDispatch({ type: '[Opening] completed' });
    }
  }, [storeDispatch, successfulExiting]);
  return (
    <>
      <DanmakuParticleField observerZ={successfulExiting ? 60 : 0} />
      <DanmakuPlanet
        x={width * 0.5}
        y={height * 0.5}
        vanishingPointX={vanishingPoint.x}
        vanishingPointY={vanishingPoint.y}
        stage={successfulExiting ? 'exiting' : 'entering'}
        dispatch={dispatch}
      />
      <OpeningTitle
        x={width * 0.5}
        y={height * 0.3}
        vanishingPointX={vanishingPoint.x}
        vanishingPointY={vanishingPoint.y}
        stage={successfulExiting ? 'exiting' : 'entering'}
        dispatch={dispatch}
      />
      {state.stage === 'exiting_failed' && <OpeningFadeOut color={black} onComplete={onComplete} />}
      <Loading
        x={width * 0.95}
        y={height * 0.95}
        anchor={bottomRight}
        dispatch={dispatch}
        startHeavyTasks={state.stage === 'heavy_loading'}
      />
      {successfulExiting && <OpeningFadeOut color={white} onComplete={onComplete} />}
    </>
  );
}

type State =
  | {
      readonly stage: 'entering';
      readonly titleEntered: boolean;
      readonly planetEntered: boolean;
    }
  | {
      readonly stage: 'heavy_loading';
    }
  | {
      readonly stage: 'exiting_successful';
    }
  | {
      readonly stage: 'exiting_failed';
    };
type Action = 'Title entered' | 'Planet entered' | 'Successfully loaded' | 'Failed to load';

function reducer(state: State, action: Action): State {
  switch (action) {
    case 'Title entered':
      return state.stage === 'entering'
        ? transitionToLoadingStateIfAllDone({ ...state, titleEntered: true })
        : state;
    case 'Planet entered':
      return state.stage === 'entering'
        ? transitionToLoadingStateIfAllDone({ ...state, planetEntered: true })
        : state;
    case 'Successfully loaded':
      return { stage: 'exiting_successful' };
    case 'Failed to load':
      return { stage: 'exiting_failed' };
  }
}

function transitionToLoadingStateIfAllDone(state: Extract<State, { stage: 'entering' }>): State {
  const { titleEntered, planetEntered } = state;
  return titleEntered && planetEntered ? { stage: 'heavy_loading' } : state;
}

export default Opening;
