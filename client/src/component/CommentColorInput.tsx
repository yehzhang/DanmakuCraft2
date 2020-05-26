import * as React from 'react';
import { ReactElement, useCallback, useRef } from 'react';
import { ColorResult } from 'react-color';
import TwitterPicker from 'react-color/lib/components/twitter/Twitter';
import { Color, fromString, toHexString } from '../data/color';
import useDomEvent, { ElementTargetEvent } from '../hook/useDomEvent';
import useHovered from '../hook/useHovered';
import useQuerySelector from '../hook/useQuerySelector';
import { selectDomain } from '../shim/domain';
import logErrorMessage from '../shim/logging/logErrorMessage';
import { createStyleSheet } from '../shim/react';
import { useDispatch, useSelector } from '../shim/redux';

function CommentColorInput() {
  const dispatch = useDispatch();
  const onChange = useCallback(
    (color: Color) =>
      dispatch({
        type: '[CommentColorInput] changed',
        color,
      }),
    [dispatch]
  );
  return renderUserInterface(onChange);
}

type RenderUserInterface = (onChange: (color: Color) => void) => ReactElement | null;

const renderUserInterface = selectDomain<RenderUserInterface>({
  danmakucraft: (onChange) => {
    const { hovered, onMouseOver, onMouseOut } = useHovered();
    const color = useSelector((state) => state.commentInputColor);
    return (
      <div style={styles.container} onMouseEnter={onMouseOver} onMouseLeave={onMouseOut}>
        <span>🎨</span>
        {hovered && (
          <div style={styles.colorPicker}>
            <TwitterPicker
              colors={colors}
              width="315px"
              color={toHexString(color)}
              onChange={({ hex }: ColorResult) => {
                const nextColor = fromString(hex);
                if (!nextColor) {
                  logErrorMessage('Expected valid color string from TwitterPicker', { hex });
                  return;
                }
                onChange(nextColor);
              }}
            />
          </div>
        )}
      </div>
    );
  },
  bilibili: (onChange) => {
    const elementRef = useRef(null);
    useQuerySelector('.bilibili-player-video-btn-danmaku', elementRef);
    useDomEvent(elementRef, 'click', (event: ElementTargetEvent) => {
      if (!event.target.classList.contains('bui-color-picker-option')) {
        return;
      }
      const data = event.target.getAttribute('data-value');
      const color = data && fromString(data);
      if (!color) {
        logErrorMessage('Expected valid color string from Bilibili color picker', { data });
        return;
      }
      onChange(color);
    });
    useDomEvent(elementRef, 'change', (event: ElementTargetEvent) => {
      if (!event.target.classList.contains('bui-input-input')) {
        return;
      }
      const color = fromString((event.target as HTMLInputElement).value);
      if (color) {
        onChange(color);
      }
    });

    return null;
  },
});

const styles = createStyleSheet({
  container: {
    userSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    KhtmlUserSelect: 'none',
    WebkitUserSelect: 'none',
  },
  colorPicker: {
    position: 'absolute',
    paddingTop: 12,
    transform: 'translateX(-14px)',
  },
});

const colors = [
  '#FF6900',
  '#FCB900',
  '#7BDCB5',
  '#00D084',
  '#8ED1FC',
  '#0693E3',
  '#ABB8C3',
  '#EB144C',
  '#F78DA7',
  '#9900EF',
  '#FFFFFF',
  '#000000',
];

export default CommentColorInput;
