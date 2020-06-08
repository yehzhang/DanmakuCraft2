import { serverUrl } from './config';

function getResourceUrls(filename: string): string {
  const url = new URL(`resource/${filename}`, serverUrl);
  return url.href;
}

export default getResourceUrls;
