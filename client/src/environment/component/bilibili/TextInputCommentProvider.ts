import Parameters from './Parameters';
import Colors from '../../../render/Colors';
import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';
import ConditionalVariable from '../../../util/async/ConditionalVariable';
import CommentData from '../../../comment/CommentData';
import CommentProvider from '../../interface/CommentProvider';
import {bindFirst} from '../../util';
import {Phaser} from '../../../util/alias/phaser';
import Provider from '../../../util/syntax/Provider';
import $ = require('jquery');

class TextInputCommentProvider implements CommentProvider {
  constructor(
      private commentPlacingPolicy: CommentPlacingPolicy,
      private textInput: JQuery<HTMLElement>,
      private sendButton: JQuery<HTMLElement>,
      readonly commentReceived: Phaser.Signal<CommentData> = new Phaser.Signal(),
      private isRequestingForInput: boolean = false,
      private shouldRequestForInput: boolean = false,
      private isSendingComment: boolean = false,
      private isRequesting: boolean = false,
      private requestCondition: ConditionalVariable = new ConditionalVariable(),
      private canSendCondition: ConditionalVariable = new ConditionalVariable(),
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

  getAllComments(): Promise<Provider<CommentData[]>> {
    throw new TypeError('This operation is not supported');
  }

  private async onTextInput() {
    if (this.isRequestingForInput) {
      this.shouldRequestForInput = true;
      return;
    }
    this.isRequestingForInput = true;

    do {
      this.shouldRequestForInput = false;
      await this.requestForPlacingComment();
    } while (this.shouldRequestForInput);

    this.isRequestingForInput = false;
  }

  private async requestForPlacingComment(): Promise<CommentData | null> {
    while (this.isRequesting) {
      await this.requestCondition.wait();
    }

    let textInputValue = this.textInput.val();
    if (!textInputValue) {
      this.commentPlacingPolicy.cancelRequest();
      // Ok to not notify only if notify all below
      return null;
    }

    this.isRequesting = true;
    let commentData = await this.commentPlacingPolicy.requestFor(
        textInputValue.toString(),
        TextInputCommentProvider.getSelectedFontSize(),
        TextInputCommentProvider.getSelectedFontColor());
    this.isRequesting = false;

    this.requestCondition.notifyAll();

    return commentData;
  }

  private async onSendButtonClickedInitial(event: Event) {
    if (this.isSendButtonDisabled()) {
      return null;
    }

    if (this.isSendingComment) {
      return;
    }

    this.listenForCancellation(event);

    await this.sendCommentIfPermitted();

    this.isSendingComment = false;
  }

  private async sendCommentIfPermitted() {
    let commentData = await this.requestForPlacingComment();
    if (commentData == null) {
      return;
    }

    await this.canSendCondition.wait();
    if (!this.canSendComment) {
      // As long as text input is retained, there is no need to cancel request.
      return;
    }

    this.commentReceived.dispatch(commentData);
  }

  private onSendButtonClickedFinal() {
    this.canSendComment = true;
    this.canSendCondition.notifyAll();
  }

  private isSendButtonDisabled() {
    return this.sendButton.hasClass('bpui-state-disabled');
  }

  private listenForCancellation(event: Event) {
    event.stopImmediatePropagation = ((stopImmediatePropagation) => {
      return () => {
        // TODO test if stopImmediatePropagation is really called or something else
        this.canSendComment = false;
        this.canSendCondition.notifyAll();

        stopImmediatePropagation();
      };
    })(event.stopImmediatePropagation);
  }
}

export default TextInputCommentProvider;
