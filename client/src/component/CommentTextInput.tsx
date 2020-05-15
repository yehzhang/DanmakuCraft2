import * as React from 'react';
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef } from 'react';
import { Key } from 'ts-keycode-enum';
import BuffType from '../../../server/api/services/BuffType';
import { CreationRequestData } from '../../../server/api/services/request';
import { toRgbNumber } from '../data/color';
import useDomEvent, { ElementTargetEvent } from '../hook/useDomEvent';
import useQuerySelector from '../hook/useQuerySelector';
import useUncontrolledFocus from '../hook/useUncontrolledFocus';
import commentInputSelector from '../selector/commentInputSelector';
import { postToBackend } from '../shim/backend';
import bindFirst from '../shim/bilibili/bindFirst';
import { domain, selectDomain } from '../shim/domain';
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
  const user = useSelector((state) => state.user);
  const disabled = useSelector((state) => state.view !== 'main' || submitting || !user);
  const onSubmit = useCallback(() => {
    if (disabled) {
      return false;
    }

    if (!user) {
      console.error('Unexpected comment submission when signed out');
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

    const flatCommentData = {
      size,
      color: toRgbNumber(color),
      text: commentText,
      coordinateX: position.x,
      coordinateY: position.y,
      buffType: chromatic ? BuffType.CHROMATIC : undefined,
    };
    const payload: CreationRequestData = {
      comment: flatCommentData,
      user: {
        origin: domain,
        id: user.id,
      },
    };

    postToBackend('comment', payload)
      .then(() => {
        dispatch({ type: '[CommentTextInput] submitted', data: flatCommentData });
      })
      .catch((error) => {
        console.error('Failed to submit comment', error);
        dispatch({ type: '[CommentTextInput] submit failed due to network error' });
      });

    return true;
  }, [dispatch, commentText, submitting, commentInput, user, disabled]);

  return selectDomain({
    danmakucraft: () => {
      const onFormSubmit = useCallback(
        (event: FormEvent) => {
          event.stopPropagation();
          event.preventDefault();

          onSubmit();
        },
        [onSubmit]
      );
      return (
        <form style={styles.container} onSubmit={onFormSubmit}>
          <input
            disabled={disabled}
            ref={elementRef}
            style={styles.textInput}
            type="text"
            value={commentText}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onTextChanged(event.target.value);
            }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <input type="submit" style={styles.submitInput} />
        </form>
      );
    },
    bilibili: () => {
      const textInputElementRef = useRef<HTMLInputElement>(null);
      useQuerySelector('input.bilibili-player-video-danmaku-input', textInputElementRef);
      useDomEvent(textInputElementRef, 'input', (event: ElementTargetEvent) => {
        onTextChanged((event.target as HTMLInputElement).value);
      });

      useDomEvent(textInputElementRef, 'focus', onFocus);
      useDomEvent(textInputElementRef, 'blur', onBlur);

      useDomEvent(textInputElementRef, 'keydown', (event: KeyboardEvent) => {
        if (
          (event.which || event.keyCode) === Key.Enter &&
          !(event.target as HTMLInputElement).value
        ) {
          dispatch({ type: '[CommentTextInput/bilibili] enter key down when empty' });
        }
      });

      useEffect(() => {
        if (textInputElementRef.current) {
          textInputElementRef.current.value = commentText;
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