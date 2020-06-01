import express, { Express } from 'express';
import { join } from 'path';
import './typing/hoganExpress';

declare global {
  let app: Express;
}

async function main() {
  (globalThis as any).app = express();

  await import('./src/app');

  app.use(express.static(join(__dirname, 'public')));

  const port = 3000;
  app.listen(port, () => void console.log(`Website available at http://localhost:${port}`));
}

main();
