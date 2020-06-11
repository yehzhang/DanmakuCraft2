import { fromRgbNumber } from '../../data/color';
import { CommentEntity } from '../../data/entity';
import { IdKeyed } from '../../state';
import checkExhaustive from '../checkExhaustive';
import ParametricTypeError from '../logging/ParametricTypeError';
import fetchBackend, { InboundAttributes } from './fetchBackend';
import parseDateData from './parseDateData';

async function getLatestCommentEntities(sessionToken: string): Promise<IdKeyed<CommentEntity>> {
  const result = await fetchBackend('classes/Entity', 'GET', {
    type: 'query',
    sessionToken,
    order: {
      createdAt: -1,
    },
    limit: 15000,
  });
  if (result.type === 'rejected') {
    throw new ParametricTypeError('Unexpected error when listing latest comment entities', {
      result,
    });
  }

  const {
    value: { results },
  } = result;
  const commentEntities: Writeable<IdKeyed<CommentEntity>> = {};
  const errors = [];
  for (const attributes of results) {
    try {
      const keyedCommentEntity = buildCommentEntity(attributes);
      Object.assign(commentEntities, keyedCommentEntity);
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length && errors.length === results.length) {
    throw new ParametricTypeError('Expected at least one valid comment entity', { errors });
  }

  return commentEntities;
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

function buildCommentEntity(attributes: InboundAttributes<CommentEntity>): IdKeyed<CommentEntity> {
  const {
    objectId,
    createdAt: rawCreatedAt,
    x,
    y,
    text,
    size,
    type: rawType,
    color,
    userId,
  } = attributes;
  if (typeof objectId !== 'string') {
    throw new ParametricTypeError('Expected valid attribute objectId', attributes);
  }
  const createdAt = parseDateData(rawCreatedAt);
  if (!createdAt) {
    throw new ParametricTypeError('Expected valid attribute createdAt', attributes);
  }
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
  if (userId !== undefined && typeof userId !== 'string') {
    throw new ParametricTypeError('Expected valid attribute userId', attributes);
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
      [objectId]: {
        type,
        color: fromRgbNumber(color),
        x,
        y,
        text,
        size,
        createdAt,
        userId,
      },
    };
  }
  if (type === 'chromatic') {
    return {
      [objectId]: {
        type,
        x,
        y,
        text,
        size,
        createdAt,
        userId,
      },
    };
  }
  checkExhaustive(type);
}

export default getLatestCommentEntities;
