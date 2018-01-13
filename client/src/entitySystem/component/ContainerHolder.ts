import ImmutableContainer from '../../util/entityStorage/ImmutableContainer';

class ContainerHolder<T> {
  constructor(public container: ImmutableContainer<T>) {
  }
}

export default ContainerHolder;
