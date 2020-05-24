import * as React from 'react';
import { useRef } from 'react';
import { Color } from '../data/color';
import { memo } from '../shim/react';
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
  readonly x?: number;
  readonly y?: number;
  readonly text: string;
  readonly size: number;
  readonly createdAt?: Date;
}

function Comment(props: Props) {
  const { x, y, text, size, createdAt } = props;
  const { current: fresh } = useRef(
    Date.now() < (createdAt ? createdAt.getTime() : -Infinity) + maxFreshCommentAgeMs
  );
  const commentElement =
    props.type === 'chromatic' ? (
      <ChromaticComment x={x} y={y} text={text} size={size} />
    ) : (
      <ShadowedText x={x} y={y} text={text} color={props.color} size={size} />
    );
  return fresh ? <Blink>{commentElement}</Blink> : commentElement;
}

const maxFreshCommentAgeMs = 1000;

export default memo(Comment);
