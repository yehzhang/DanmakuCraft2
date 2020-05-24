import { fromRgbNumber } from '../../data/color';
import { CommentEntity } from '../../data/entity';
import checkExhaustive from '../checkExhaustive';
import existsObject from '../existsObject';
import ParametricTypeError from '../ParametricTypeError';
import { CommentEntityConstructor, InboundParseObject, ParseQueryConstructor } from './parse';

async function getLatestCommentEntities(): Promise<CommentEntity[]> {
  const commentParseObjects = await new ParseQueryConstructor(CommentEntityConstructor)
    .descending('createdAt')
    .limit(15000)
    .find();

  const commentEntities = [];
  const errors = [];
  for (const commentParseObject of commentParseObjects) {
    try {
      commentEntities.push(buildCommentEntity(commentParseObject));
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length) {
    const errorSummary = errors.reduce((summary, error) => {
      summary[error.message] = (summary[error.message] || 0) + 1;
      return summary;
    }, {});
    console.error('Failed to parse some comments', errors[0], errorSummary);
  }

  return commentParseObjects.map(buildCommentEntity).filter(existsObject);
}

function buildCommentEntity(parseObject: InboundParseObject<CommentEntity>): CommentEntity {
  const {
    createdAt,
    attributes: { x, y, text, size, type: rawType, color },
  } = parseObject;
  if (typeof x !== 'number') {
    throw new ParametricTypeError('Expected valid attribute x', parseObject);
  }
  if (typeof y !== 'number') {
    throw new ParametricTypeError('Expected valid attribute y', parseObject);
  }
  if (typeof text !== 'string') {
    throw new ParametricTypeError('Expected valid attribute text', parseObject);
  }
  if (typeof size !== 'number') {
    throw new ParametricTypeError('Expected valid attribute size', parseObject);
  }

  if (typeof rawType !== 'string') {
    throw new ParametricTypeError('Expected valid attribute type', parseObject);
  }
  const type = rawType as CommentEntity['type'];
  if (type === 'plain') {
    if (typeof color !== 'number') {
      throw new ParametricTypeError('Expected valid attribute color', { parseObject });
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
