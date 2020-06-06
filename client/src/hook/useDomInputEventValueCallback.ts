import { ChangeEvent, useCallback } from 'react';

function useDomInputEventValueCallback(callback: (value: string) => void) {
  const memoizedCallback = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      callback(event.target.value);
    },
    [callback]
  );
  return memoizedCallback;
}

export default useDomInputEventValueCallback;
