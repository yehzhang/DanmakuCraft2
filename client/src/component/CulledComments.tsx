import { Container } from '@inlet/react-pixi';
import * as React from 'react';
import visibleCommentEntityNodesSelector from '../selector/visibleCommentEntityNodesSelector';
import { equalEntityNodeArrays } from '../selector/visibleEntityNodesSelector';
import { useSelector } from '../shim/redux';
import Comment from './Comment';

function CulledComments() {
  const commentEntityNodes = useSelector(visibleCommentEntityNodesSelector, equalEntityNodeArrays);
  return (
    <Container>
      {commentEntityNodes.map(({ id, entity: commentEntity }) => (
        <Comment key={id} id={id} {...commentEntity} />
      ))}
    </Container>
  );
}

export default CulledComments;
