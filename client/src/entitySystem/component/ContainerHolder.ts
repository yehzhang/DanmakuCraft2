import ImmutableContainer from '../../util/dataStructures/ImmutableContainer';

class ContainerHolder<T> {
  constructor(public container: ImmutableContainer<T>) {
  }
}

export default ContainerHolder;
