import * as React from 'react';
import { SignEntity } from '../data/entity';
import TextSign from './TextSign';
import WorldCenter from './WorldCenter';
import WorldOrigin from './WorldOrigin';

interface Props {
  readonly entity: SignEntity;
}

function Sign(props: Props) {
  const { entity } = props;
  switch (entity.type) {
    case 'spawn_point':
      return <TextSign {...entity} />;
    case 'world_center':
      return <WorldCenter {...entity} />;
    case 'world_origin':
      return <WorldOrigin {...entity} />;
  }
}

export default Sign;
