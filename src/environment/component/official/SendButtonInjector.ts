import UniverseProxy from '../../interface/UniverseProxy';
import BuffDataContainer from '../../../comment/BuffDataContainer';
import {bindFirst} from '../../util';

class SendButtonInjector {
  constructor(
      private universeProxy: UniverseProxy,
      private $textInput: JQuery<HTMLElement>,
      private $sendButton: JQuery<HTMLElement>,
      private buffDataContainer: BuffDataContainer) {
    bindFirst($sendButton, 'click', (event: Event) => this.onClickSendButtonInitial(event));
  }

  private onClickSendButtonInitial(event: Event) {

  }
}

export default SendButtonInjector;
