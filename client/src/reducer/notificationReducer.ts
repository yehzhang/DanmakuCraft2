import { nanoid } from 'nanoid';
import { Action } from '../action';
import { Buff } from '../data/entity';
import { I18nTextIdentifier } from '../data/i18n';
import { JustText, NotificationState } from '../state';

const initialState: NotificationState | null = null;

function notificationReducer(state = initialState, action: Action): NotificationState | null {
  switch (action.type) {
    case '[Chest] opened by player': {
      const { buff } = action;
      return createNotification(getMessageByBuff(buff));
    }
    case '[ConsoleInput] notification pushed': {
      const { text } = action;
      return createNotification({ just: text });
    }
    case '[CommentTextInput] submit failed due to collision':
      return createNotification('commentCollision');
    case '[CommentTextInput] submit failed due to network error':
      return createNotification('backendError');
    case '[Tutorial] hinted movement keys for the first time':
      return createNotification('firstMovementTutorial');
    case '[Tutorial] hinted movement keys for the second time':
      return createNotification('secondMovementTutorial');
    case '[Tutorial] hinted movement keys for the last time':
      return createNotification('finalMovementTutorial');
    case '[Tutorial] hinted comment key':
      return createNotification('commentTutorial');
    case '[SpeechBubble] display expired':
    case '[Opening] genesis':
      return initialState;
    default:
      return state;
  }
}

function getMessageByBuff(buff: Buff): I18nTextIdentifier {
  switch (buff.type) {
    case 'none':
      return 'noneBuffNotification';
    case 'chromatic':
      return 'chromaticBuffNotification';
    case 'hasty':
      return 'hastyBuffNotification';
  }
}

function createNotification(message: JustText | I18nTextIdentifier): NotificationState {
  return {
    id: nanoid(),
    message,
  };
}

export default notificationReducer;
