import Container from '../../util/entityStorage/Container';

class ContainerHolder<T> {
  constructor(public container: Container<T>) {
  }
}

export default ContainerHolder;
