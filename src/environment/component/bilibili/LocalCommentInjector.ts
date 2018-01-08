import {bindFirst} from '../../util';
import Parameters from './Parameters';
import Colors from '../../../render/Colors';
import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';

class LocalCommentInjector {
  constructor(
      private commentPlacingPolicy: CommentPlacingPolicy,
      private $textInput: JQuery<HTMLElement> = $('.bilibili-player-video-danmaku-input'),
      private $sendButton: JQuery<HTMLElement> = $('.bilibili-player-video-btn-send')) {
    bindFirst(this.$sendButton, 'click', this.onClickSendButtonInitial.bind(this));
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
    let commentSize = LocalCommentInjector.getSelectedFontSize();
    let commentColor = Colors.WHITE_NUMBER; // TODO
    let commentData = this.commentPlacingPolicy.requestFor(commentText, commentSize, commentColor);
    if (commentData == null) {
      event.stopImmediatePropagation();
      return;
    }
  }

  private isSendButtonDisabled() {
    return this.$sendButton.hasClass('bpui-state-disabled');
  }
}

export default LocalCommentInjector;
