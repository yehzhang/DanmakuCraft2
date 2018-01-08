import Parameters from './Parameters';
import Colors from '../../../render/Colors';
import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';
import ConditionalVariable from '../../../util/async/ConditionalVariable';
import CommentData from '../../../comment/CommentData';
import CommentProvider from '../../interface/CommentProvider';
import {bindFirst} from '../../util';
import Phaser = require('phaser-ce-type-updated/build/custom/phaser-split');

class TextInputCommentProvider implements CommentProvider {
  constructor(
      private commentPlacingPolicy: CommentPlacingPolicy,
      readonly commentReceived: Phaser.Signal<CommentData> = new Phaser.Signal(),
      private textInput: JQuery<HTMLElement> = $('.bilibili-player-video-danmaku-input'),
      private sendButton: JQuery<HTMLElement> = $('.bilibili-player-video-btn-send'),
      private isSendingComment: boolean = false,
      private canSendCondition: ConditionalVariable = new ConditionalVariable(),
      private cannotSendCondition: ConditionalVariable = new ConditionalVariable(),
      private canSendComment: boolean = false) {
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
    this.sendButton.on('click', this.onSendButtonClickedFinal.bind(this));
  }

  getAllComments(): Promise<CommentData[]> {
    throw new TypeError('This operation is not supported');
  }

  private onTextInput() {
    let ignored = this.requestForPlacingComment();
  }

  private async requestForPlacingComment(): Promise<CommentData | null> {
    if (this.isSendButtonDisabled()) {
      return null;
    }

    let textInputValue = this.textInput.val();
    if (!textInputValue) {
      return null;
    }

    return this.commentPlacingPolicy.requestFor(
        textInputValue.toString(),
        TextInputCommentProvider.getSelectedFontSize(),
        TextInputCommentProvider.getSelectedFontColor());
  }

  private async onSendButtonClickedInitial(event: Event) {
    if (this.isSendingComment) {
      return;
    }

    this.listenForCancellation(event);

    await this.sendCommentIfAppropriate();

    this.isSendingComment = false;
  }

  private async sendCommentIfAppropriate() {
    let commentData = await this.requestForPlacingComment();
    if (commentData == null) {
      return;
    }

    await Promise.race([this.canSendCondition.wait(), this.cannotSendCondition.wait()]);
    if (!this.canSendComment) {
      return;
    }

    this.commentReceived.dispatch(commentData);
  }

  private async onSendButtonClickedFinal() {
    this.canSendComment = true;
    this.canSendCondition.notify();
  }

  private isSendButtonDisabled() {
    return this.sendButton.hasClass('bpui-state-disabled');
  }

  private listenForCancellation(event: Event) {
    event.stopImmediatePropagation = ((stopImmediatePropagation) => {
      return () => {
        // TODO test if stopImmediatePropagation is really called or something else
        this.canSendComment = false;
        this.cannotSendCondition.notify();

        stopImmediatePropagation();
      };
    })(event.stopImmediatePropagation);
  }
}

export default TextInputCommentProvider;
