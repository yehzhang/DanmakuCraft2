import {range} from 'sequency';
import Queue from './Queue';

class Semaphore {
  constructor(value: number = 1, private readonly queue: Queue<void> = new Queue()) {
    range(0, value).forEach(() => queue.push(undefined));
  }

  async acquire() {
    await this.queue.shift();
  }

  release() {
    const ignored = this.queue.push(undefined);
  }
}

export default Semaphore;
