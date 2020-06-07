import * as React from 'react';
import { ChangeEvent, FormEvent, useCallback, useReducer, useRef, useState } from 'react';
import { I18nTextIdentifier } from '../data/i18n';
import i18nData from '../data/i18n/zh';
import fetchBackend from '../shim/backend/fetchBackend';
import checkExhaustive from '../shim/checkExhaustive';
import { createStyle, createStyleSheet, memo } from '../shim/react';
import { useDispatch } from '../shim/redux';

function EmailAuthForm() {
  const [type, dispatchType] = useReducer(reducer, 'sign_up');
  const [username, setUsername] = useState('');
  const setUsernameFromEvent = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    usernameInputRef.current?.setCustomValidity('');
    setUsername(event.target.value);
  }, []);
  const [email, setEmail] = useState('');
  const setEmailFromEvent = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    emailInputRef.current?.setCustomValidity('');
    setEmail(event.target.value);
  }, []);
  const [password, setPassword] = useState('');
  const setPasswordFromEvent = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  }, []);

  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const onFormSubmit = useCallback(
    async (event: FormEvent) => {
      event.stopPropagation();
      event.preventDefault();

      if (submitting) {
        return;
      }

      setSubmitting(true);

      // TODO Sign in / sign up
      // TODO enable email verify
      const response = await fetchBackend('users', 'POST', {
        type: 'jsonBody',
        data: {
          username,
          email: email || undefined,
          password,
        },
      });

      setSubmitting(false);

      if (response.type === 'rejected') {
        if (response.errorType === 'user_email_taken') {
          emailInputRef.current?.setCustomValidity(i18nData.emailTaken);
        } else if (response.errorType === 'username_taken') {
          usernameInputRef.current?.setCustomValidity(i18nData.usernameTaken);
        } else if (response.errorType === 'unknown') {
          usernameInputRef.current?.setCustomValidity(i18nData.unknownError);
        } else {
          checkExhaustive(response.errorType);
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
    [type, submitting, username, email, password, dispatch]
  );

  return (
    <form ref={formRef} style={styles.container} onSubmit={onFormSubmit}>
      <p style={styles.title}>{i18nData[getTitleIdentifier(type)]}</p>
      <input
        ref={usernameInputRef}
        style={styles.firstTextInput}
        type="text"
        minLength={3}
        maxLength={24}
        required
        placeholder={i18nData.username}
        value={username}
        onChange={setUsernameFromEvent}
      />
      <input
        ref={emailInputRef}
        style={styles.middleTextInput}
        type="email"
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
          dispatchType();
        }}
      >
        {i18nData[getSubtitleIdentifier(type)]}
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
  middleTextInput: {
    ...textInputStyle,
    borderRadius: 0,
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

type FormType = 'sign_up' | 'sign_in';

function getTitleIdentifier(type: FormType): I18nTextIdentifier {
  switch (type) {
    case 'sign_in':
      return 'signIn';
    case 'sign_up':
      return 'signUp';
  }
}

function getSubtitleIdentifier(type: FormType): I18nTextIdentifier {
  switch (type) {
    case 'sign_in':
      return 'signUpForNewAccount';
    case 'sign_up':
      return 'signInWithExistingAccount';
  }
}

function reducer(state: FormType): FormType {
  switch (state) {
    case 'sign_in':
      return 'sign_up';
    case 'sign_up':
      return 'sign_in';
  }
}

export default memo(EmailAuthForm);
