import * as React from 'react';
import { ChangeEvent, ReactElement, useCallback } from 'react';
import useDomEvent, { ElementTargetEvent } from '../hook/useDomEvent';
import { selectDomain } from '../shim/domain';
import { createStyleSheet } from '../shim/react';
import { useDispatch, useSelector } from '../shim/redux';

function CommentSizeInput() {
  const dispatch = useDispatch();
  const onChange = useCallback(
    (size: number) => {
      dispatch({ type: '[CommentSizeInput] changed', size });
    },
    [dispatch]
  );
  return renderUserInterface(onChange);
}

type RenderUserInterface = (onChange: (size: number) => void) => ReactElement | null;

const renderUserInterface = selectDomain<RenderUserInterface>({
  danmakucraft: (onChange) => {
    const size = useSelector((state) => state.commentInputSize);
    return (
      <div style={styles.container}>
        <label htmlFor={selectElementId} style={styles.label}>
          字号
        </label>
        <select
          id={selectElementId}
          style={styles.select}
          value={size}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            const parsedSize = Number(event.target.value);
            if (!isNaN(parsedSize)) {
              onChange(parsedSize);
            }
          }}
        >
          <option value="18">小</option>
          <option value="25">标准</option>
        </select>
      </div>
    );
  },
  bilibili: (onChange) => {
    const element = document.querySelector<HTMLDivElement>('.bilibili-player-video-btn-danmaku');
    if (!element) {
      console.error('Expected Bilibili danmaku input element');
    }
    useDomEvent(element, 'click', (event: ElementTargetEvent) => {
      const selectionFieldElement = event.target.classList.contains('selection-name')
        ? event.target.parentElement
        : event.target;
      if (selectionFieldElement?.getAttribute('data-type') !== 'fontsize') {
        return;
      }

      const size = Number(selectionFieldElement.getAttribute('data-value'));
      if (!isNaN(size)) {
        onChange(size);
      }
    });

    return null;
  },
});

const styles = createStyleSheet({
  container: {
    margin: '0 10px',
  },
  label: {
    whiteSpace: 'nowrap',
    fontSize: 14,
  },
  select: {
    height: 20,
  },
});

const selectElementId = 'comment-input-size';

export default CommentSizeInput;
