import {ChunkManager} from './chunk';

export class CommentData {
  constructor(
      public readonly showTime: number,
      public readonly mode: number,
      public readonly size: number,
      public readonly color: number,
      public readonly sendTime: number,
      public readonly userId: number,
      public readonly text: string,
      public readonly positionX: number, // These positions may be invalid.
      public readonly positionY: number,
      public readonly advancedCommentType: number,
      public readonly advancedCommentParameter: number) {
  }
}

export class CommentManager {
  private isLoaded: boolean;

  constructor(private chunkManager: ChunkManager) {
    this.isLoaded = false;
  }

  loadInitialComments(commentsData: CommentData[]) {
    if (this.isLoaded) {
      throw new Error('Initial comments are loaded already');
    }

    // TODO

    this.isLoaded = true;
  }

  loadComment(commentData: CommentData) {

  }

  areInitialCommentsLoaded() {
    return this.isLoaded;
  }
}
