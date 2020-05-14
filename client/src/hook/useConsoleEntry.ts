import * as _ from 'lodash';
import { useEffect } from 'react';
import { useDispatch } from '../shim/redux';
import { ConsoleEntry } from '../state';
import useUniqueId from './useUniqueId';

function useConsoleEntry(entry?: ConsoleEntry) {
  if (!__DEV__) {
    return _.noop;
  }

  const dispatch = useDispatch();
  const key = useUniqueId();
  useEffect(() => {
    if (!entry) {
      return;
    }
    dispatch({ type: 'Console entry used', key, entry });
    return () => {
      dispatch({ type: 'Console entry released', key });
    };
  }, [entry?.caption, entry?.entityPosition, entry?.note, entry?.navigation, dispatch]);
}

export default useConsoleEntry;
