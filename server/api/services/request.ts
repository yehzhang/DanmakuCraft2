import {FlatCommentData} from '../../../client/src/comment/CommentData';

export interface CreationRequestData {
  comment: FlatCommentData;
  user: UserData;
  nextCreationToken: string;
}

export interface UserData {
  origin: string;
  id: string;
}
