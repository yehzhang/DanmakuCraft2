import CommentDataUtil from './CommentDataUtil';
import {Parameters} from '../../BilibiliAdapter';
import LocallyOriginatedCommentEffectManager from '../../../effect/LocallyOriginatedCommentEffectManager';
import UniverseProxy from '../../interface/UniverseProxy';
import {bindFirst} from '../../util';

export default class LocalCommentInjector {
  private $textInput: JQuery<HTMLElement>;
  private $sendButton: JQuery<HTMLElement>;
  private effectManager: LocallyOriginatedCommentEffectManager;

  constructor(private universeProxy: UniverseProxy) {
    this.$textInput = $('.bilibili-player-video-danmaku-input');

    this.$sendButton = $('.bilibili-player-video-btn-send');
    bindFirst(this.$sendButton, 'click', this.onClickSendButtonInitial.bind(this));

    this.effectManager = universeProxy.getEffectManager();
  }

  private static getSelectedFontSize() {
    let commentSize;

    let $fontSelection = $('.bilibili-player-mode-selection-row.fontsize .selection-span.active');
    let commentSizeValue = $fontSelection.attr('data-value');
    if (commentSizeValue) {
      commentSize = Number(commentSizeValue);
    } else {
      commentSize = Parameters.DEFAULT_FONT_SIZE;
    }

    return commentSize;
  }

  /**
   * Appends metadata to a comment to be sent. Does not provide comments, because every comment
   * sent is expected to be received by RemoteCommentReceiver.
   */
  private onClickSendButtonInitial(event: Event) {
    if (this.isSendButtonDisabled()) {
      return;
    }

    let commentValue = this.$textInput.val();
    if (!commentValue) {
      return;
    }

    let commentText = commentValue.toString();
    let injectedCommentText = this.buildInjectedCommentText(commentText);
    let commentSize = LocalCommentInjector.getSelectedFontSize();
    if (!this.universeProxy.requestForPlacingComment(injectedCommentText, commentSize)) {
      event.stopImmediatePropagation();
      return;
    }

    this.effectManager.activateOne();

    // Update comment text in UI and let player check if the text is valid.
    this.$textInput.val(injectedCommentText);
    this.$textInput.trigger('input');

    // If the text is invalid, the button would be disabled.
    if (this.isSendButtonDisabled()) {
      // Restore the comment text and let through the event, so that user would see the disabled
      // button, but not comment changes.
      this.$textInput.val(commentText);
    }
  }

  private buildInjectedCommentText(text: string): string {
    let effectData;
    if (this.effectManager.hasEffect()) {
      effectData = this.effectManager.peek();
    }

    let player = this.universeProxy.getPlayer();
    let playerCoordinate = player.getCoordinate();

    return CommentDataUtil.buildInjectedCommentText(text, playerCoordinate, effectData);
  }

  private isSendButtonDisabled() {
    return this.$sendButton.hasClass('bpui-state-disabled');
  }
}
