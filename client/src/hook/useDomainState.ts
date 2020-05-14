import { useSelector } from '../shim/redux';
import { BilibiliExternalDependency } from '../state';

function useDomainState<T>(domains: DomainStateSelector<T>): T | null {
  const domainState = useSelector((state) => state.domain);
  switch (domainState.type) {
    case 'danmakucraft':
      return domains.danmakucraft();
    case 'bilibili': {
      const { externalDependency } = domainState;
      return externalDependency && domains.bilibili(externalDependency);
    }
  }
}

interface DomainStateSelector<T> {
  danmakucraft(): T;

  bilibili(externalDependency: BilibiliExternalDependency): T;
}

export default useDomainState;
