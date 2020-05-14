import { Selector } from '../shim/redux';

const trimmedCommentInputSelector: Selector<string> = (state) => state.commentInputText.trim();

export default trimmedCommentInputSelector;
