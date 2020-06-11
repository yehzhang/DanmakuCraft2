import * as React from 'react';
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import i18nData from '../data/i18n/zh';
import fetchBackend from '../shim/backend/fetchBackend';
import checkExhaustive from '../shim/checkExhaustive';
import logErrorMessage from '../shim/logging/logErrorMessage';
import { createStyle, createStyleSheet, memo } from '../shim/react';
import { useDispatch } from '../shim/redux';

function EmailAuthForm() {
  const [type, setType] = useState<
    'sign_in' | 'sign_up' | 'forgot_password' | 'done_reset_password'
  >('sign_up');
  const [email, setEmail] = useState('');
  const setEmailFromEvent = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    clearErrorMessages();
    setEmail(event.target.value);
  }, []);
  const [password, setPassword] = useState('');
  const setPasswordFromEvent = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    clearErrorMessages();
    setPassword(event.target.value);
  }, []);

  const clearErrorMessages = () => {
    emailInputRef.current?.setCustomValidity('');
  };
  useEffect(() => void clearErrorMessages(), [type]);

  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const onFormSubmit = useCallback(
    async (event: FormEvent) => {
      event.stopPropagation();
      event.preventDefault();

      if (submitting) {
        return;
      }

      setSubmitting(true);

      await (async () => {
        if (type === 'forgot_password') {
          await fetchBackend('requestPasswordReset', 'POST', {
            type: 'key_value',
            data: {
              email,
            },
          });

          setType('done_reset_password');

          return;
        }

        if (type === 'sign_up') {
          const response = await fetchBackend('users', 'POST', {
            type: 'key_value',
            data: {
              username: email,
              email,
              password,
            },
          });
          if (response.type === 'rejected') {
            const { errorType } = response;
            if (errorType === 'username_taken') {
              emailInputRef.current?.setCustomValidity(i18nData.emailTaken);
            } else if (errorType === 'unknown') {
              emailInputRef.current?.setCustomValidity(i18nData.unknownError);
            } else {
              checkExhaustive(errorType);
              return;
            }
            formRef.current?.reportValidity();
            return;
          }

          const {
            value: { objectId, sessionToken },
          } = response;
          dispatch({ type: '[EmailAuthForm] signed up', userId: objectId, sessionToken });

          const ignored = fetchBackend('verificationEmailRequest', 'POST', {
            type: 'key_value',
            data: {
              email,
            },
          });

          return;
        }

        if (type === 'sign_in') {
          const response = await fetchBackend('login', 'POST', {
            type: 'key_value',
            data: {
              username: email,
              password,
            },
          });
          if (response.type === 'rejected') {
            const { errorType } = response;
            if (errorType === 'invalid_username_or_password') {
              emailInputRef.current?.setCustomValidity(i18nData.emailOrPasswordIncorrect);
            } else if (errorType === 'unknown') {
              emailInputRef.current?.setCustomValidity(i18nData.unknownError);
            } else {
              checkExhaustive(errorType);
              return;
            }
            formRef.current?.reportValidity();
            return;
          }

          const {
            value: { objectId, sessionToken },
          } = response;
          dispatch({ type: '[EmailAuthForm] signed in', userId: objectId, sessionToken });

          return;
        }

        if (type === 'done_reset_password') {
          logErrorMessage('Unexpected form submission when password is reset');
          return;
        }

        checkExhaustive(type);
      })();

      setSubmitting(false);
    },
    [type, submitting, email, password, dispatch]
  );

  return (
    <div style={styles.container}>
      <form ref={formRef} style={styles.form} onSubmit={onFormSubmit}>
        <p style={styles.title}>
          {type === 'sign_up'
            ? i18nData.signUp
            : type === 'sign_in'
            ? i18nData.signIn
            : type === 'forgot_password'
            ? i18nData.findPassword
            : type === 'done_reset_password'
            ? i18nData.doneResetPassword
            : checkExhaustive(type)}
        </p>
        <input
          ref={emailInputRef}
          style={styles.firstTextInput}
          type="email"
          required
          placeholder={i18nData.email}
          value={email}
          onChange={setEmailFromEvent}
          disabled={type === 'done_reset_password'}
        />
        {(type === 'sign_in' || type === 'sign_up') && (
          <input
            style={styles.lastTextInput}
            type="password"
            minLength={6}
            maxLength={18}
            required
            placeholder={i18nData.password}
            value={password}
            onChange={setPasswordFromEvent}
          />
        )}
        {(type === 'sign_in' || type === 'sign_up' || type === 'forgot_password') && (
          <button style={styles.submitInput} disabled={submitting}>
            {submitting ? i18nData.submitting : i18nData.continue}
          </button>
        )}
      </form>
      <div style={styles.belowFormRow}>
        <span
          style={styles.link}
          onClick={() =>
            void setType(
              type === 'sign_in'
                ? 'forgot_password'
                : type === 'forgot_password' || type === 'done_reset_password'
                ? 'sign_in'
                : type
            )
          }
        >
          {type === 'sign_in'
            ? i18nData.forgotPasswordQuestion
            : type === 'forgot_password' || type === 'done_reset_password'
            ? i18nData.return
            : null}
        </span>
        <span
          style={styles.link}
          onClick={() =>
            void setType(type === 'sign_up' ? 'sign_in' : type === 'sign_in' ? 'sign_up' : type)
          }
        >
          {type === 'sign_up'
            ? i18nData.signInWithExistingAccount
            : type === 'sign_in'
            ? i18nData.signUpForNewAccount
            : null}
        </span>
      </div>
    </div>
  );
}

const borderWidth = 1;
const textInputStyle = createStyle({
  borderWidth,
  borderColor: 'silver',
  borderStyle: 'solid',
  padding: '1rem',
  marginBottom: -borderWidth,
});
const borderRadius = 4;
const styles = createStyleSheet({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    width: 300,
    padding: '0 50px',
    borderRadius,
    alignItems: 'stretch',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    margin: 0,
  },
  title: {
    fontSize: 22,
    alignSelf: 'center',
  },
  belowFormRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    marginBottom: '1rem',
  },
  link: {
    color: '#1a0dab',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  firstTextInput: {
    ...textInputStyle,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  lastTextInput: {
    ...textInputStyle,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
  },
  submitInput: {
    marginTop: '1rem',
    border: 0,
    borderRadius,
    background: 'silver',
    lineHeight: 3,
  },
});

export default memo(EmailAuthForm);
