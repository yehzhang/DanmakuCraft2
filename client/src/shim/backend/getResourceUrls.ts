import { appConfig } from './initializeBackend';

function getResourceUrls(filename: string): string {
  const url = new URL(`resource/${filename}`, appConfig.serverUrl);
  return url.href;
}

export default getResourceUrls;
