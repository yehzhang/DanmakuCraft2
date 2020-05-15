import { MutableRefObject, useEffect } from 'react';

function useQuerySelector<T extends Element>(selector: string, ref: MutableRefObject<T | null>) {
  useEffect(() => {
    const element = document.querySelector<T>(selector);
    if (element) {
      ref.current = element;
    } else {
      console.error('Failed to query element with selector', selector);
    }
  }, []);
}

export default useQuerySelector;
