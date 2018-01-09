import Moving from './Moving';
import Chromatic from './Chromatic';
import Hasty from './Hasty';

interface BuffFactory {
  createInputControllerMover(): Moving;

  createWorldWanderingMover(): Moving;

  createChromatic(): Chromatic;

  createHasty(): Hasty;
}

export default BuffFactory;
