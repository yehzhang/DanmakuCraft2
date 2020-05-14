import { FlatCommentDataRequest } from './FlatCommentData';

export interface CreationRequestData {
  comment: FlatCommentDataRequest;
  user: UserData;
}

export interface UserData {
  origin: Domain;
  id: string | null;
}

export type Domain = 'danmakucraft' | 'bilibili';
