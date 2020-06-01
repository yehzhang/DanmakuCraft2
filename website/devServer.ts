import express, { Express } from 'express';

declare global {
  let app: Express;
}

async function main() {
  (globalThis as any).app = express();

  await import('./src/app');

  const port = 3000;
  app.listen(port, () => void console.log(`Website available at http://localhost:${port}`));
}

main();
