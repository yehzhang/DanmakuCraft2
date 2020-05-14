import React, { memo } from 'react';
import { black, white } from '../data/color';
import { magnitude } from '../data/coordinate';
import { map, Point, show, zip } from '../data/point';
import { getWorldCoordinate, getWorldDistance } from '../data/unboundedWorld';
import { useSelector } from '../shim/redux';
import PlainText from './PlainText';

interface Props {
  readonly y: number;
  readonly caption: string;
  readonly entityPosition?: Point;
  readonly note?: string | null;
  readonly navigation?: boolean;
}

function ConsoleDisplayListing({
  y,
  caption,
  entityPosition,
  note = null,
  navigation = false,
}: Props) {
  const text = useFormattedText(caption, navigation, note, entityPosition);
  const color = useSelector((state) => {
    switch (state.view) {
      case 'opening':
        return white;
      case 'main':
        return black;
    }
  });
  return <PlainText y={y} text={text} color={color} size={15} />;
}

function useFormattedText(
  caption: string,
  navigation: boolean,
  note: string | null,
  entityPosition?: Point
): string {
  const playerPosition = useSelector((state) => state.player.position, arePointsClose);

  note = note !== null ? ` (${note})` : '';

  let entityPositionText;
  if (entityPosition) {
    entityPosition = map(map(entityPosition, getWorldCoordinate), Math.floor);
    entityPositionText = `: ${show(entityPosition)}`;
  } else {
    entityPositionText = '';
  }

  let navigationText;
  if (navigation && entityPosition) {
    navigationText = useNavigation(entityPosition, playerPosition);
  } else {
    navigationText = '';
  }

  return `${caption}${note}${entityPositionText}${navigationText}`;
}

function useNavigation(entityPosition: Point, playerPosition: Point): string {
  const offsets = zip(playerPosition, entityPosition, getWorldDistance);
  const horizontalDirection = getDirection(offsets.x);
  const verticalDirection = getDirection(offsets.y);
  const direction = '•←→↑↖↗↓↙↘'.charAt(horizontalDirection + verticalDirection * 3);
  const distance = Math.round(magnitude(offsets));
  return ` ${direction} (${distance})`;
}

function getDirection(offset: number): 0 | 1 | 2 {
  if (Math.abs(offset) < sameDirectionThreshold) {
    return 0;
  }
  if (offset > 0) {
    return 1;
  }
  return 2;
}

const sameDirectionThreshold = 200;

export function arePointsClose(point: Point, point_: Point): boolean {
  const { x: xClose, y: yClose } = zip(point, point_, (x, x_) => Math.abs(x - x_) < 100);
  return xClose && yClose;
}

export default memo(ConsoleDisplayListing);
