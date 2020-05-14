import * as React from 'react';
import { ReactNode } from 'react';
import { useSelector } from '../shim/redux';
import { ViewName } from '../state';

interface Props {
  readonly name: ViewName;
  readonly children: ReactNode;
}

function View({ name, children }: Props) {
  const active = useSelector((state) => state.view === name);
  if (!active) {
    return null;
  }
  return <>{children}</>;
}

export default View;
