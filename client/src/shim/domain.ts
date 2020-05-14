import { Domain } from '../../../server/api/services/request';

export function selectDomain<T>(domains: DomainData<T>): GetDomain<T>;
export function selectDomain<T>(domains: Partial<DomainData<T>>): GetDomain<T> | undefined;
export function selectDomain<T, U>(domains: DomainData<T, U>): GetDomain<T, U>;
export function selectDomain<T, U>(domains: Partial<DomainData<T, U>>): GetDomain<T, U> | undefined;
export function selectDomain<T, U>(domains: Partial<DomainData<T, U>>) {
  return domains[domain];
}

type GetDomain<T, U = T> = DomainData<T, U>[typeof domain];

export type DomainData<D, B = D> = {
  readonly danmakucraft: D;
  readonly bilibili: B;
};

export const domain: Domain =
  document.location.hostname === 'www.bilibili.com' ? 'bilibili' : 'danmakucraft';
