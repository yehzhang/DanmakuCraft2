import * as React from 'react';
import { ChangeEvent, FormEvent, ReactElement, useCallback, useEffect, useRef } from 'react';
import { Key } from 'ts-keycode-enum';
import { CommentEntity } from '../data/entity';
import useDomEvent, { ElementTargetEvent } from '../hook/useDomEvent';
import useQuerySelector from '../hook/useQuerySelector';
import useUncontrolledFocus from '../hook/useUncontrolledFocus';
import commentInputSelector from '../selector/commentInputSelector';
import { OutboundAttributes } from '../shim/backend/parse/objectConstructors';
import postCommentEntity from '../shim/backend/postCommentEntity';
import bindFirst from '../shim/bilibili/bindFirst';
import { selectDomain } from '../shim/domain';
import logError from '../shim/logging/logError';
import { createStyleSheet } from '../shim/react';
import { useDispatch, useSelector } from '../shim/redux';

function CommentTextInput() {
  const submitting = useSelector((state) => state.commentInputSubmitting);
  const elementRef = useRef<HTMLInputElement | null>(null);
  const { onFocus, onBlur } = useUncontrolledFocus({
    targetRef: elementRef,
    focusTarget: 'comment_input',
    onFocusActionType: '[CommentTextInput] focused',
    onBlurActionType: '[CommentTextInput] blurred',
    extraDeps: [submitting],
  });

  const dispatch = useDispatch();
  const onTextChanged = useCallback(
    (value: string) => {
      dispatch({ type: '[CommentTextInput] changed', value: value.trimLeft() });
    },
    [dispatch]
  );

  const commentText = useSelector((state) => state.commentInputText);
  const commentInput = useSelector(commentInputSelector);
  const bilibiliUserId = useSelector(
    (state) => (state.domain.type === 'bilibili' && state.domain.userId) || undefined
  );
  const disabled = useSelector((state) => state.view !== 'main' || submitting);
  const onSubmit = useCallback(() => {
    if (disabled) {
      return false;
    }

    const trimmedValue = commentText.trim();
    if (!trimmedValue) {
      dispatch({ type: '[CommentTextInput] submit failed due to empty text' });
      return false;
    }

    const { position, collision, color, size, chromatic } = commentInput;
    if (collision) {
      dispatch({ type: '[CommentTextInput] submit failed due to collision' });
      return false;
    }

    dispatch({ type: '[CommentTextInput] started submission' });

    const outboundCommentEntity: OutboundAttributes<CommentEntity> = {
      ...(chromatic
        ? {
            type: 'chromatic',
          }
        : {
            type: 'plain',
            color,
          }),
      size,
      text: commentText,
      ...position,
    };
    postCommentEntity(outboundCommentEntity, bilibiliUserId)
      .then(([id, commentEntity]) => {
        dispatch({ type: '[CommentTextInput] submitted', id, commentEntity });
      })
      .catch((error) => {
        logError(error);
        dispatch({ type: '[CommentTextInput] submit failed due to backend error' });
      });

    return true;
  }, [dispatch, commentText, submitting, commentInput, bilibiliUserId, disabled]);

  return selectDomain<() => ReactElement | null>({
    danmakucraft: () => {
      const onFormSubmit = useCallback(
        (event: FormEvent) => {
          event.stopPropagation();
          event.preventDefault();

          onSubmit();
        },
        [onSubmit]
      );
      const onTextInputChangedEvent = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onTextChanged(event.target.value);
      }, []);
      return (
        <form style={styles.container} onSubmit={onFormSubmit}>
          <input
            disabled={disabled}
            ref={elementRef}
            style={styles.textInput}
            type="text"
            value={commentText}
            onChange={onTextInputChangedEvent}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <input type="submit" style={styles.submitInput} />
        </form>
      );
    },
    bilibili: () => {
      useQuerySelector('input.bilibili-player-video-danmaku-input', elementRef);
      useDomEvent(elementRef, 'input', (event: ElementTargetEvent) => {
        onTextChanged((event.target as HTMLInputElement).value);
      });

      useDomEvent(elementRef, 'focus', onFocus);
      useDomEvent(elementRef, 'blur', onBlur);

      useDomEvent(elementRef, 'keydown', (event: KeyboardEvent) => {
        if (
          (event.which || event.keyCode) === Key.Enter &&
          !(event.target as HTMLInputElement).value
        ) {
          dispatch({ type: '[CommentTextInput/bilibili] enter key down when empty' });
        }
      });

      useEffect(() => {
        if (elementRef.current) {
          elementRef.current.value = commentText;
        }
      }, [commentText]);

      const onSubmitRef = useRef(onSubmit);
      onSubmitRef.current = onSubmit;
      const $ = useSelector((state) =>
        state.domain.type === 'bilibili' ? state.domain.externalDependency?.$ : undefined
      );
      useEffect(() => {
        if (!$) {
          return;
        }

        const $sendButton = $('.bilibili-player-video-btn-send');
        return bindFirst($sendButton, 'click', (event) => {
          if ($sendButton.hasClass('bui-button-disabled')) {
            return;
          }

          const success = onSubmitRef.current();
          if (!success) {
            event.stopImmediatePropagation();
            event.preventDefault();
          }
        });
      }, [$]);

      return null;
    },
  })();
}

const styles = createStyleSheet({
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: 500,
    margin: '0 10px',
  },
  textInput: {
    flex: 1,
    outline: 'none',
    borderStyle: 'solid',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'silver',
    fontSize: 14,
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.05), 0 3px 6px rgba(0, 0, 0, 0.05)',
    padding: 8,
  },
  submitInput: {
    display: 'none',
  },
});

export default CommentTextInput;
