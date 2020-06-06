export interface I18nTextData {
  mainSceneLoaded: string;
  mainSceneLoadingFailed: string;
  mainSceneLoading: string;
  title: string;
  bilibiliNotSignedIn: string;

  signUp: string;
  signIn: string;

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
}

export type I18nTextIdentifier = keyof I18nTextData;
