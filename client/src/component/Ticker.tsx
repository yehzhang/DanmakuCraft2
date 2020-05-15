import * as _ from 'lodash';
import useTick from '../hook/useTick';
import { useDispatch, useSelector } from '../shim/redux';
import { State } from '../state';

function Ticker() {
  const dispatch = useDispatch();
  const state = useSelector<State>(_.identity);
  useTick((deltaMs: number) => {
    dispatch({ type: '[Ticker] ticked', deltaMs, state });
  });

  return null;
}

export default Ticker;
