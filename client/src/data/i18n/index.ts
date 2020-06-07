export interface I18nTextData {
  mainSceneLoaded: string;
  mainSceneLoadingFailed: string;
  mainSceneLoading: string;
  title: string;
  bilibiliNotSignedIn: string;

  signUp: string;
  signIn: string;
  signInWithExistingAccount: string;
  signUpForNewAccount: string;
  email: string;
  password: string;
  continue: string;
  submitting: string;
  expectedNonEmptyEmail: string;
  expectedNonEmptyPassword: string;
  emailTaken: string;

  firstMovementTutorial: string;
  secondMovementTutorial: string;
  finalMovementTutorial: string;
  commentTutorial: string;

  noneBuffNotification: string;
  chromaticBuffNotification: string;
  hastyBuffNotification: string;

  commentCollision: string;

  fontSizeLabel: string;
  fontSizeSmall: string;
  fontSizeMedium: string;

  backendError: string;
  unknownError: string;
}

export type I18nTextIdentifier = keyof I18nTextData;
