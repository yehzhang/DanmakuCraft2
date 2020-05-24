import { exec as exec_, ExecOptions } from 'child_process';
import { promisify } from 'util';

/** Returns stdout. */
async function execute(command: string, options?: Omit<ExecOptions, 'encoding'>): Promise<string> {
  console.log('Running command:', command);
  const { stdout, stderr } = await exec(command, options);
  if (stderr) {
    console.error(stderr);
  }

  return stdout as string;
}

const exec = promisify(exec_);

export default execute;
