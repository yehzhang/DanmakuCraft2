import { Container, Sprite } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import * as React from 'react';
import { center } from '../data/anchors';
import { toRgbNumber, warning } from '../data/color';
import { map } from '../data/point';
import commentInputDimensionsSelector from '../selector/commentInputDimensionsSelector';
import commentInputSelector from '../selector/commentInputSelector';
import trimmedCommentInputSelector from '../selector/trimmedCommentInputSelector';
import { useSelector } from '../shim/redux';
import Comment from './Comment';

function CommentInputPreview() {
  const text = useSelector(trimmedCommentInputSelector);
  if (!text) {
    return null;
  }
  return <CommentInputPreview_ text={text} />;
}

interface Props {
  readonly text: string;
}

function CommentInputPreview_({ text }: Props) {
  const commentInputDimensions = useSelector(commentInputDimensionsSelector);
  const { x: width, y: height } = map(commentInputDimensions, (x) => x + warningBoxPadding1d);
  const { position, collision, color, size, chromatic } = useSelector(commentInputSelector);
  const submitting = useSelector((state) => state.commentInputSubmitting);
  return (
    <Container {...position} alpha={submitting ? 0.3 : 1}>
      <Sprite
        texture={PIXI.Texture.WHITE}
        y={warningBoxOffsetY}
        width={width}
        height={height}
        anchor={center}
        tint={toRgbNumber(warning)}
        alpha={collision ? 0.9 : 0}
      />
      <Comment text={text} color={color} size={size} type={chromatic ? 'chromatic' : 'plain'} />
    </Container>
  );
}

const warningBoxOffsetY = -5;
const warningBoxPadding1d = 4;

export default CommentInputPreview;
