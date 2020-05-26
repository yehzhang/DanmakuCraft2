import identity from 'lodash/identity';
import * as React from 'react';
import { ComponentType, CSSProperties } from 'react';

type StyleSheet<T extends string> = {
  readonly [key in T]: Readonly<CSSProperties>;
};

export const memo = __DEV__ ? lazyModuleMemo : React.memo;

// A hack to get whyDidYouRender to work.
export function lazyModuleMemo<T extends ComponentType<any>>(Component: T) {
  return React.memo(Component);
}

export const createStyleSheet: <T extends string>(
  styleSheet: StyleSheet<T>
) => StyleSheet<T> = identity;
