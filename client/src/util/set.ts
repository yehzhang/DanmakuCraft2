import {asSequence} from 'sequency';

export function leftOuterJoin<T>(set: Iterable<T>, other: ReadonlySet<T>): Iterable<T> {
  return asSequence(set).filter(value => !other.has(value)).asIterable();
}
