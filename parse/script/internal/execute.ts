import childProcess from 'child_process';
import { promisify } from 'util';

/** Returns stdout. */
async function execute(command: string): Promise<string> {
  console.log('Running command:', command);
  const { stdout, stderr } = await exec(command);
  if (stderr) {
    console.error(stderr);
  }

  return stdout;
}

const exec = promisify(childProcess.exec);

export default execute;
