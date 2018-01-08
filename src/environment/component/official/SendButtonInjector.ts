import UniverseProxy from '../../interface/UniverseProxy';
import {bindFirst} from '../../util';

class SendButtonInjector {
  constructor(
      private universeProxy: UniverseProxy,
      private $textInput: JQuery<HTMLElement>,
      private $sendButton: JQuery<HTMLElement>) {
    bindFirst($sendButton, 'click', (event: Event) => this.onClickSendButtonInitial(event));
  }

  private onClickSendButtonInitial(event: Event) {

  }
}

export default SendButtonInjector;
