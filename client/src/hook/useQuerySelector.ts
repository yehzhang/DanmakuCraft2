import { MutableRefObject, useEffect } from 'react';
import logErrorMessage from '../shim/logging/logErrorMessage';

function useQuerySelector<T extends Element>(selector: string, ref: MutableRefObject<T | null>) {
  useEffect(() => {
    const element = document.querySelector<T>(selector);
    if (element) {
      ref.current = element;
    } else {
      logErrorMessage('Expected element from selector', { selector });
    }
  }, []);
}

export default useQuerySelector;
