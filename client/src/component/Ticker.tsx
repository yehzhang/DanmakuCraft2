import useTick from '../hook/useTick';
import { useDispatch, useStore } from '../shim/redux';

function Ticker() {
  const dispatch = useDispatch();
  const store = useStore();
  useTick((deltaMs: number) => {
    dispatch({ type: '[Ticker] ticked', deltaMs, state: store.getState() });
  });

  return null;
}

export default Ticker;
