import * as React from 'react';
import { ReactElement, useCallback } from 'react';
import { ColorResult } from 'react-color';
import TwitterPicker from 'react-color/lib/components/twitter/Twitter';
import { Color, fromString, toHexString } from '../data/color';
import useDomEvent, { ElementTargetEvent } from '../hook/useDomEvent';
import useHovered from '../hook/useHovered';
import { selectDomain } from '../shim/domain';
import { createStyleSheet, memo } from '../shim/react';
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
    const hexColorString = useSelector((state) => toHexString(state.commentInputColor));
    return (
      <div style={styles.container} onMouseEnter={onMouseOver} onMouseLeave={onMouseOut}>
        <span>🎨</span>
        {hovered && (
          <div style={styles.colorPicker}>
            <TwitterPicker
              colors={colors}
              width="315px"
              color={hexColorString}
              onChange={({ hex }: ColorResult) => {
                const color = fromString(hex);
                if (color) {
                  onChange(color);
                }
              }}
            />
          </div>
        )}
      </div>
    );
  },
  bilibili: (onChange) => {
    const element = document.querySelector<HTMLDivElement>('.bilibili-player-video-btn-danmaku');
    if (!element) {
      console.error('Expected Bilibili danmaku settings element');
    }
    useDomEvent(element, 'click', (event: ElementTargetEvent) => {
      if (!event.target.classList.contains('bui-color-picker-option')) {
        return;
      }
      const data = event.target.getAttribute('data-value');
      const color = data && fromString(data);
      if (color) {
        onChange(color);
      }
    });
    useDomEvent(element, 'change', (event: ElementTargetEvent) => {
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

export default memo(CommentColorInput);
