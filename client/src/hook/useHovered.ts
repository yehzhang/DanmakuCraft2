import { useCallback, useState } from 'react';

function useHovered(): {
  hovered: boolean;
  onMouseOver: () => void;
  onMouseOut: () => void;
} {
  const [hovered, setHovered] = useState(false);
  const onMouseOver = useCallback(() => {
    setHovered(true);
  }, []);
  const onMouseOut = useCallback(() => {
    setHovered(false);
  }, []);
  return {
    hovered,
    onMouseOver,
    onMouseOut,
  };
}

export default useHovered;
