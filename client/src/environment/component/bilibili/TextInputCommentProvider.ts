import Colors from '../../../render/Colors';
import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';
import CommentData from '../../../comment/CommentData';
import CommentProvider from '../../interface/CommentProvider';
import {bindFirst} from '../../util';
import {Phaser} from '../../../util/alias/phaser';
import Provider from '../../../util/syntax/Provider';
import Widgets from './Widgets';

class TextInputCommentProvider implements CommentProvider {
  private static readonly DEFAULT_COMMENT_SIZE = 25;

  constructor(
      private commentPlacingPolicy: CommentPlacingPolicy,
      private widgets: Widgets,
      readonly commentReceived: Phaser.Signal<CommentData> = new Phaser.Signal(),
      private commentText: string | null = null,
      private commentSize: number = TextInputCommentProvider.DEFAULT_COMMENT_SIZE,
      private commentColor: number = Colors.WHITE_NUMBER) {
  }

  connect() {
    // On comment text changed
    this.widgets.textInput.on('input', () => {
      let textInputValue = this.widgets.textInput.val();
      if (textInputValue && textInputValue.constructor === Array) {
        textInputValue = (textInputValue as string[])[0];
      }
      if (textInputValue) {
        this.commentText = textInputValue.toString();
      } else {
        this.commentText = null;
      }

      this.onCommentInput();
    });
    this.widgets.textInput.on('focus', () => this.onCommentInput());

    // On font size changed
    $('.bilibili-player-video-sendbar .bilibili-player-mode-selection-row.fontsize .row-selection .selection-span')
        .on('click', event => {
          let value = event.currentTarget.getAttribute('data-value');
          if (!value) {
            return;
          }
          this.commentSize = parseInt(value, 10);

          this.onCommentInput();
        });

    // On color changed
    this.widgets.colorPalette.on('click', event => {
      let value = event.target.getAttribute('data-color');
      if (!value) {
        return;
      }
      this.updateCommentColor(value);

      this.onCommentInput();
    });
    this.widgets.colorInput.on('change', event => {
      let value = (event.target as HTMLInputElement).value;
      this.updateCommentColor(value);

      this.onCommentInput();
    });

    // On comment sent
    bindFirst(this.widgets.sendButton, 'click', event => this.onSendButtonClickedInitially(event));
  }

  private updateCommentColor(value: string) {
    this.commentColor = Phaser.Color.hexToRGB(value) & 0xFFFFFF;
  }

  onCommentInput() {
    this.requestForPlacingComment();
  }

  getAllComments(): Promise<Provider<CommentData[]>> {
    throw new TypeError('This operation is not supported');
  }

  private requestForPlacingComment() {
    if (!this.commentText) {
      this.commentPlacingPolicy.cancelRequest();
      return null;
    }
    return this.commentPlacingPolicy.requestFor(
        this.commentText,
        this.commentSize,
        this.commentColor);
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
    return this.widgets.sendButton.hasClass('bpui-state-disabled');
  }
}

export default TextInputCommentProvider;
