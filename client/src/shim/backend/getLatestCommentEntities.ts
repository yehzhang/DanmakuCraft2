import { fromRgbNumber } from '../../data/color';
import { CommentEntity } from '../../data/entity';
import { IdKeyed } from '../../state';
import checkExhaustive from '../checkExhaustive';
import logError from '../logging/logError';
import ParametricTypeError from '../logging/ParametricTypeError';
import { CommentEntityConstructor } from './objectConstructors';
import ParseQueryConstructor, { InboundAttributes } from './ParseQueryConstructor';

async function getLatestCommentEntities(): Promise<IdKeyed<CommentEntity>> {
  const commentParseObjects = await new ParseQueryConstructor(CommentEntityConstructor)
    .descending('createdAt')
    .limit(15000)
    .find();

  const commentEntities: Writeable<IdKeyed<CommentEntity>> = {};
  let errorCount = 0;
  for (const parseObject of commentParseObjects) {
    try {
      const commentEntity = buildCommentEntity(parseObject);
      commentEntities[parseObject.id] = commentEntity;
    } catch (error) {
      errorCount++;
      logError(error);
    }
  }

  if (errorCount && errorCount === commentParseObjects.length) {
    throw new TypeError('Expected at least one valid comment entity');
  }

  return commentEntities;
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

function buildCommentEntity(
  parseObject: Parse.Object<InboundAttributes<CommentEntity>>
): CommentEntity {
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
