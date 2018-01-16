import Parameters from './Parameters';
import Colors from '../../../render/Colors';
import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';
import CommentData from '../../../comment/CommentData';
import CommentProvider from '../../interface/CommentProvider';
import {bindFirst} from '../../util';
import {Phaser} from '../../../util/alias/phaser';
import Provider from '../../../util/syntax/Provider';

class TextInputCommentProvider implements CommentProvider {
  constructor(
      private commentPlacingPolicy: CommentPlacingPolicy,
      private textInput: JQuery<HTMLElement>,
      private sendButton: JQuery<HTMLElement>,
      private fontSelection =
          $('.bilibili-player-mode-selection-row.fontsize .selection-span.active'),
      private colorInput =
          $('.bilibili-player-video-sendbar .bilibili-player-color-picker-color-code'),
      readonly commentReceived: Phaser.Signal<CommentData> = new Phaser.Signal()) {
  }

  private getSelectedFontSize(): number {
    let commentSizeValue = this.fontSelection.attr('data-value');
    if (commentSizeValue) {
      return Number(commentSizeValue);
    }
    return Parameters.DEFAULT_FONT_SIZE;
  }

  private getSelectedFontColor(): number {
    let inputValue = this.colorInput.val();
    if (inputValue != null) {
      if (inputValue.constructor === Array) {
        inputValue = (inputValue as string[])[0];
      }
      if (inputValue.constructor === Number) {
        return inputValue as number;
      }
      if (inputValue.constructor === String) {
        return Phaser.Color.hexToRGB(inputValue as string) & 0xFFFFFF;
      }
    }
    return Colors.WHITE_NUMBER;
  }

  connect() {
    this.textInput.on('input', () => this.onTextInput());
    this.textInput.on('focus', () => this.onTextInput());
    bindFirst(this.sendButton, 'click', event => this.onSendButtonClickedInitially(event));
  }

  getAllComments(): Promise<Provider<CommentData[]>> {
    throw new TypeError('This operation is not supported');
  }

  private onTextInput() {
    this.requestForPlacingComment();
  }

  private requestForPlacingComment() {
    let textInputValue = this.textInput.val();
    if (textInputValue && textInputValue.constructor === Array) {
      textInputValue = (textInputValue as string[])[0];
    }
    if (!textInputValue) {
      this.commentPlacingPolicy.cancelRequest();
      return null;
    }

    return this.commentPlacingPolicy.requestFor(
        textInputValue.toString(),
        this.getSelectedFontSize(),
        this.getSelectedFontColor());
  }

  private onSendButtonClickedInitially(event: JQuery.Event) {
    if (this.isSendButtonDisabled()) {
      return null;
    }

    let commentData = this.requestForPlacingComment();
    if (commentData == null) {
      event.stopImmediatePropagation();
      return;
    }

    this.commentPlacingPolicy.commitRequest();

    this.commentReceived.dispatch(commentData);
  }

  private isSendButtonDisabled() {
    return this.sendButton.hasClass('bpui-state-disabled');
  }
}

export default TextInputCommentProvider;
