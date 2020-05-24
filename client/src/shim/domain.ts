export function selectDomain<T>(domains: DomainData<T>): T;
export function selectDomain<T>(domains: Partial<DomainData<T>>): T | undefined;
export function selectDomain<T>(domains: Partial<DomainData<T>>) {
  return domains[domain];
}

type DomainData<T> = {
  readonly [key in Domain]: T;
};

export const domain: Domain =
  document.location.hostname === 'www.bilibili.com' ? 'bilibili' : 'danmakucraft';

type Domain = 'danmakucraft' | 'bilibili';
