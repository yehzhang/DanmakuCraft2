import Queue from './Queue';
import {range} from 'sequency';

class Semaphore {
  constructor(value: number = 1, private queue: Queue<void> = new Queue()) {
    range(0, value).forEach(() => queue.push(undefined));
  }

  async acquire() {
    await this.queue.shift();
  }

  release() {
    let ignored = this.queue.push(undefined);
  }
}

export default Semaphore;
