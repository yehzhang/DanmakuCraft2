import { Container } from '@inlet/react-pixi';
import * as _ from 'lodash';
import * as React from 'react';
import { ReactNode } from 'react';
import { equal, map, zip } from '../data/point';
import { useSelector } from '../shim/redux';

interface Props {
  children: ReactNode;
}

function Camera({ children }: Props) {
  const containerSize = useSelector((state) => state.containerSize);
  const halfContainerSize = map(containerSize, (n) => n / 2);
  const cameraPosition = useSelector((state) => state.cameraPosition, equal);
  const centeredViewOffsets = zip(halfContainerSize, cameraPosition, _.subtract);
  return <Container {...centeredViewOffsets}>{children}</Container>;
}

export default Camera;
