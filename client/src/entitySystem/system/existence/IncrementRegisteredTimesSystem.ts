import ExistenceSystem from './ExistenceSystem';
import RegisteredTimes from '../../component/RegisteredTimes';

class IncrementRegisteredTimesSystem implements ExistenceSystem<RegisteredTimes> {
  adopt(times: RegisteredTimes) {
    times.registeredTimes++;
  }

  abandon(times: RegisteredTimes) {
  }
}

export default IncrementRegisteredTimesSystem;
