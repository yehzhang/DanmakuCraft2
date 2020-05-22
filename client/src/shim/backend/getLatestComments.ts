import { fromRgbNumber } from '../../data/color';
import { CommentEntity } from '../../data/entity';
import checkExhaustive from '../checkExhaustive';
import existsObject from '../existsObject';
import { createParseObjectConstructor, InboundParseObject, ParseQueryConstructor } from './parse';

async function getLatestComments(): Promise<CommentEntity[]> {
  const comments = await new ParseQueryConstructor(CommentEntityConstructor)
    .descending('createdAt')
    .limit(15000)
    .find();
  return comments.map(buildCommentEntity).filter(existsObject);
}

const CommentEntityConstructor = createParseObjectConstructor('CommentEntity');

function buildCommentEntity(parseObject: InboundParseObject<CommentEntity>): CommentEntity | null {
  const {
    createdAt,
    attributes: { x, y, text, size, type: rawType, color },
  } = parseObject;
  if (typeof x !== 'number') {
    console.error('Expected valid attribute x', parseObject);
    return null;
  }
  if (typeof y !== 'number') {
    console.error('Expected valid attribute y', parseObject);
    return null;
  }
  if (typeof text !== 'string') {
    console.error('Expected valid attribute text', parseObject);
    return null;
  }
  if (typeof size !== 'number') {
    console.error('Expected valid attribute size', parseObject);
    return null;
  }

  if (typeof rawType !== 'string') {
    console.error('Expected valid attribute type', parseObject);
    return null;
  }
  const type = rawType as CommentEntity['type'];
  if (type === 'plain') {
    if (typeof color !== 'number') {
      console.error('Expected valid attribute color', parseObject);
      return null;
    }
    return {
      type,
      color: fromRgbNumber(color),
      x,
      y,
      text,
      size,
      createdAt,
    };
  }
  if (type === 'chromatic') {
    return {
      type,
      x,
      y,
      text,
      size,
      createdAt,
    };
  }
  checkExhaustive(type);
  return null;
}

export default getLatestComments;
