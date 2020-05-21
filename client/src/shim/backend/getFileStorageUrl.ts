import { port as devPort } from '../../../../server/config/env/development';
import { frontend as frontendConfig } from '../../../../server/config/frontend';

function getFileStorageUrl(path: string): string {
  const url = new URL(baseUrl);
  url.pathname = path;
  return url.href;
}

const baseUrl = __LOCAL_BACKEND__ ? `http://localhost:${devPort}` : frontendConfig.baseUrl;

export default getFileStorageUrl;
