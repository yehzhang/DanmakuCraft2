import Parameters from './Parameters';
import Colors from '../../../render/Colors';
import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';
import CommentData from '../../../comment/CommentData';
import CommentProvider from '../../interface/CommentProvider';
import {bindFirst} from '../../util';
import {Phaser} from '../../../util/alias/phaser';
import Provider from '../../../util/syntax/Provider';
import Timeout from '../../../util/async/Timeout';
import Delivery from '../../../util/async/Delivery';

class TextInputCommentProvider implements CommentProvider {
  constructor(
      private commentPlacingPolicy: CommentPlacingPolicy,
      private textInput: JQuery<HTMLElement>,
      private sendButton: JQuery<HTMLElement>,
      readonly commentReceived: Phaser.Signal<CommentData> = new Phaser.Signal(),
      private sendButtonTimeout: Timeout = new Timeout(Phaser.Timer.SECOND),
      private isSendingComment: boolean = false) {
  }

  private static getSelectedFontSize(): number {
    let $fontSelection = $('.bilibili-player-mode-selection-row.fontsize .selection-span.active');
    let commentSizeValue = $fontSelection.attr('data-value');
    if (commentSizeValue) {
      return Number(commentSizeValue);
    }
    return Parameters.DEFAULT_FONT_SIZE;
  }

  private static getSelectedFontColor(): number {
    return Colors.WHITE_NUMBER; // TODO
  }

  connect() {
    this.textInput.on('input', this.onTextInput.bind(this));
    bindFirst(this.sendButton, 'click', this.onSendButtonClickedInitial.bind(this));
  }

  getAllComments(): Promise<Provider<CommentData[]>> {
    throw new TypeError('This operation is not supported');
  }

  private onTextInput() {
    this.requestForPlacingComment();
  }

  private requestForPlacingComment() {
    let textInputValue = this.textInput.val();
    if (!textInputValue) {
      this.commentPlacingPolicy.cancelRequest();
      // Ok to not notify only if notify all below
      return null;
    }

    return this.commentPlacingPolicy.requestFor(
        textInputValue.toString(),
        TextInputCommentProvider.getSelectedFontSize(),
        TextInputCommentProvider.getSelectedFontColor());
  }

  private async onSendButtonClickedInitial(event: Event) {
    if (this.isSendButtonDisabled()) {
      return null;
    }

    let commentData = this.requestForPlacingComment();
    if (commentData == null) {
      event.stopImmediatePropagation();
      return;
    }

    if (this.isSendingComment) {
      return;
    }
    this.isSendingComment = true;

    let canSendComment = new Delivery<boolean>();

    let onFinalCallback = () => canSendComment.set(true);
    this.sendButton.on('click', onFinalCallback);

    await Promise.race([canSendComment.wait(), this.rejectSendingCommentAfterTimeout(canSendComment)]);

    if (canSendComment.get()) {
      this.commentReceived.dispatch(commentData);
    }

    this.sendButton.off('click', onFinalCallback);

    // Set false after sent
    this.isSendingComment = false;
  }

  private isSendButtonDisabled() {
    return this.sendButton.hasClass('bpui-state-disabled');
  }

  private async rejectSendingCommentAfterTimeout(delivery: Delivery<boolean>) {
    await this.sendButtonTimeout.wait();
    delivery.set(false);
  }
}

export default TextInputCommentProvider;
