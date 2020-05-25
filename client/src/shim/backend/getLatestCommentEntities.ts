import { fromRgbNumber } from '../../data/color';
import { CommentEntity } from '../../data/entity';
import checkExhaustive from '../checkExhaustive';
import existsObject from '../existsObject';
import ParametricTypeError from '../logging/ParametricTypeError';
import { CommentEntityConstructor, InboundParseObject, ParseQueryConstructor } from './parse';

async function getLatestCommentEntities(): Promise<CommentEntity[]> {
  const commentParseObjects = await new ParseQueryConstructor(CommentEntityConstructor)
    .descending('createdAt')
    .limit(15000)
    .find();
  return commentParseObjects.map(buildCommentEntity).filter(existsObject);
}

function buildCommentEntity(parseObject: InboundParseObject<CommentEntity>): CommentEntity {
  const { createdAt, attributes } = parseObject;
  const { x, y, text, size, type: rawType, color } = attributes;
  if (typeof x !== 'number') {
    throw new ParametricTypeError('Expected valid attribute x', attributes);
  }
  if (typeof y !== 'number') {
    throw new ParametricTypeError('Expected valid attribute y', attributes);
  }
  if (typeof text !== 'string') {
    throw new ParametricTypeError('Expected valid attribute text', attributes);
  }
  if (typeof size !== 'number') {
    throw new ParametricTypeError('Expected valid attribute size', attributes);
  }

  if (typeof rawType !== 'string') {
    throw new ParametricTypeError('Expected valid attribute type', attributes);
  }
  const type = rawType as CommentEntity['type'];
  if (type === 'plain') {
    if (typeof color !== 'number') {
      throw new ParametricTypeError('Expected valid attribute color', attributes);
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
}

export default getLatestCommentEntities;
