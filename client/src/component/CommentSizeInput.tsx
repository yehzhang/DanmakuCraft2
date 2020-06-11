import * as React from 'react';
import { ChangeEvent, ReactElement, useCallback, useRef } from 'react';
import i18nData from '../data/i18n/zh';
import useDomEvent, { ElementTargetEvent } from '../hook/useDomEvent';
import useQuerySelector from '../hook/useQuerySelector';
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
          {i18nData.fontSizeLabel}
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
          <option value="18">{i18nData.fontSizeSmall}</option>
          <option value="25">{i18nData.fontSizeMedium}</option>
        </select>
      </div>
    );
  },
  bilibili: (onChange) => {
    const elementRef = useRef(null);
    useQuerySelector('.bilibili-player-video-btn-danmaku', elementRef);
    useDomEvent(elementRef, 'click', (event: ElementTargetEvent) => {
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
