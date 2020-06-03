import { Container } from '@inlet/react-pixi';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CommentEntity } from '../data/entity';
import { EntityIndexNode } from '../data/entityIndex';
import { map } from '../data/point';
import visibleCommentEntityNodesSelector from '../selector/visibleCommentEntityNodesSelector';
import { equalEntityNodeArrays } from '../selector/visibleEntityNodesSelector';
import { useSelector } from '../shim/redux';
import Comment from './Comment';

function CulledComments() {
  const commentEntityNodes = useSelector(visibleCommentEntityNodesSelector, equalEntityNodeArrays);
  const [chunks, setChunks] = useState<Chunks>({});
  useEffect(() => {
    const newChunks: Chunks = {};
    for (const commentEntityNode of commentEntityNodes) {
      const chunkPosition = map(commentEntityNode.entity, (x) => Math.floor(x / 100));
      const chunkIndex = `${chunkPosition.x}_${chunkPosition.y}`;
      const chunk = (newChunks[chunkIndex] = newChunks[chunkIndex] || []);
      chunk.push(commentEntityNode);
    }
    setChunks(newChunks);
  }, [commentEntityNodes]);

  return (
    <>
      {Object.entries(chunks).map(([chunkIndex, chunk]) => (
        <Container key={chunkIndex}>
          {chunk.map(({ id, entity: commentEntity }) => (
            <Comment key={id} id={id} {...commentEntity} />
          ))}
        </Container>
      ))}
    </>
  );
}

interface Chunks {
  [key: string]: EntityIndexNode<CommentEntity>[];
}

export default CulledComments;
