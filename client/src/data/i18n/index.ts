export interface I18nTextData {
  mainSceneLoaded: string;
  mainSceneLoadingFailed: string;
  mainSceneLoading: string;
  title: string;
  bilibiliNotSignedIn: string;

  firstMovementTutorial: string;
  secondMovementTutorial: string;
  finalMovementTutorial: string;
  commentTutorial: string;

  noneBuffNotification: string;
  chromaticBuffNotification: string;
  hastyBuffNotification: string;

  commentCollision: string;

  backendError: string;
}

export type I18nTextIdentifier = keyof I18nTextData;
