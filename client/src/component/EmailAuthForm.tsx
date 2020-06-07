import * as React from 'react';
import { ChangeEvent, FormEvent, useCallback, useReducer, useRef, useState } from 'react';
import i18nData from '../data/i18n/zh';
import fetchBackend from '../shim/backend/fetchBackend';
import checkExhaustive from '../shim/checkExhaustive';
import { createStyle, createStyleSheet, memo } from '../shim/react';
import { useDispatch } from '../shim/redux';

function EmailAuthForm() {
  const [createUser, dispatchCreateUser] = useReducer((x) => !x, true);
  const [email, setEmail] = useState('');
  const setEmailFromEvent = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    emailInputRef.current?.setCustomValidity('');
    setEmail(event.target.value);
  }, []);
  const [password, setPassword] = useState('');
  const setPasswordFromEvent = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    emailInputRef.current?.setCustomValidity('');
    setPassword(event.target.value);
  }, []);

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

      // TODO enable email verify
      const payload = {
        type: 'keyValue',
        data: {
          username: email,
          email,
          password,
        },
      } as const;
      const response = await (createUser
        ? fetchBackend('users', 'POST', payload)
        : fetchBackend('login', 'GET', payload));

      setSubmitting(false);

      if (response.type === 'rejected') {
        const { errorType } = response;
        if (errorType === 'email_taken') {
          emailInputRef.current?.setCustomValidity(i18nData.emailTaken);
        } else if (errorType === 'invalid_email_or_password') {
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
        value: { sessionToken },
      } = response;
      dispatch({ type: '[EmailAuthForm] signed in', sessionToken });
    },
    [createUser, submitting, email, password, dispatch]
  );

  return (
    <form ref={formRef} style={styles.container} onSubmit={onFormSubmit}>
      <p style={styles.title}>{createUser ? i18nData.signUp : i18nData.signIn}</p>
      <input
        ref={emailInputRef}
        style={styles.firstTextInput}
        type="email"
        required
        placeholder={i18nData.email}
        value={email}
        onChange={setEmailFromEvent}
      />
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
      <button style={styles.submitInput} disabled={submitting}>
        {submitting ? i18nData.submitting : i18nData.continue}
      </button>
      <span
        style={styles.switchForm}
        onClick={(event) => {
          event.preventDefault();
          dispatchCreateUser();
        }}
      >
        {createUser ? i18nData.signUpForNewAccount : i18nData.signInWithExistingAccount}
      </span>
    </form>
  );
}

const borderWidth = 1;
const textInputStyle = createStyle({
  alignSelf: 'stretch',
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
  },
  title: {
    fontSize: 22,
    alignSelf: 'center',
  },
  switchForm: {
    alignSelf: 'flex-end',
    marginBottom: '1rem',
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
    alignSelf: 'stretch',
    margin: '1rem 0',
    border: 0,
    borderRadius,
    background: 'silver',
    lineHeight: 3,
  },
});

export default memo(EmailAuthForm);
