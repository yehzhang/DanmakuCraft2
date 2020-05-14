import * as React from 'react';
import { useEffect } from 'react';
import checkExhaustive from '../shim/checkExhaustive';
import { useDispatch, useSelector } from '../shim/redux';

function Tutorial() {
  const stage = useSelector((state) => state.tutorial.stage);
  const dispatch = useDispatch();
  useEffect(() => {
    switch (stage) {
      case 'firstMovementKeys':
        dispatch({ type: '[Tutorial] hinted movement keys for the first time' });
        return;
      case 'secondMovementKeys':
        dispatch({ type: '[Tutorial] hinted movement keys for the second time' });
        return;
      case 'finalMovementKeys':
        dispatch({ type: '[Tutorial] hinted movement keys for the last time' });
        return;
      case 'commentKeys':
        dispatch({ type: '[Tutorial] hinted comment key' });
        return;
      case 'preMovementKeys':
      case 'preCommentKeys':
      case 'end':
        return;
      default:
        checkExhaustive(stage);
    }
  }, [stage, dispatch]);

  return null;
}

export default Tutorial;
