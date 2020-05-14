import { asSequence } from 'sequency';
import shortid from 'shortid';
import { BilibiliCommentData } from './commentData';

export function getUserRelations(commentsData: readonly BilibiliCommentData[]): UserRelation[] {
  return asSequence(commentsData)
    .map((data) => data.userId)
    .distinct()
    .mapIndexed((index, externalId) => ({
      externalId,
      userId: shortid.generate(),
      userIndex: index + 2,
    }))
    .toArray();
}

export interface UserRelation {
  readonly externalId: string;
  readonly userId: string;
  readonly userIndex: UserIndex;
}

type UserIndex = number;

export function getExternalUser({ userIndex, externalId }: UserRelation): ExternalRelation {
  return {
    origin: 'bilibili',
    correspondsTo: userIndex,
    externalId,
  };
}

export interface ExternalRelation {
  readonly origin: 'bilibili';
  readonly correspondsTo: UserIndex;
  readonly externalId: string;
}
