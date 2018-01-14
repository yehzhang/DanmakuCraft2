import VisibilitySystem from './VisibilitySystem';
import Predicate from '../../../util/syntax/Predicate';

class ConditionedSystem<T> implements VisibilitySystem<T> {
  constructor(private system: VisibilitySystem<T>, private enterPredicate: Predicate<T>) {
  }

  enter(component: T) {
    if (!this.enterPredicate(component)) {
      return;
    }
    this.system.enter(component);
  }

  update(component: T, time: Phaser.Time) {
    this.system.update(component, time);
  }

  exit(component: T) {
    this.system.exit(component);
  }

  finish() {
    this.system.finish();
  }
}

export default ConditionedSystem;
