import * as React from 'react';
import { useRef } from 'react';
import { Color } from '../data/color';
import { memo } from '../shim/react';
import { useSelector } from '../shim/redux';
import Blink from './Blink';
import ChromaticComment from './ChromaticComment';
import ShadowedText from './ShadowedText';

type Props = PlainCommentEntityProps | ChromaticCommentEntityProps;

interface PlainCommentEntityProps extends CommentEntityPropsCommon {
  readonly type: 'plain';
  readonly color: Color;
}

interface ChromaticCommentEntityProps extends CommentEntityPropsCommon {
  readonly type: 'chromatic';
}

interface CommentEntityPropsCommon {
  readonly id?: string;
  readonly x?: number;
  readonly y?: number;
  readonly text: string;
  readonly size: number;
}

function Comment(props: Props) {
  const { id, x, y, text, size } = props;
  const receivedAt = useSelector((state) => (id && state.receivedCommentEntities[id]) || null);
  const { current: fresh } = useRef(
    Date.now() < (receivedAt ? receivedAt.getTime() : -Infinity) + maxFreshCommentAgeMs
  );
  const commentElement =
    props.type === 'chromatic' ? (
      <ChromaticComment x={x} y={y} text={text} size={size} />
    ) : (
      <ShadowedText x={x} y={y} text={text} color={props.color} size={size} />
    );
  return fresh ? <Blink>{commentElement}</Blink> : commentElement;
}

const maxFreshCommentAgeMs = 2000;

export default memo(Comment);
