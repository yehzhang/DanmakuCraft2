import { readFileSync } from 'fs';
import { parseStringPromise } from 'xml2js';
import BuffType from '../server/api/services/BuffType';
import { FlatCommentDataResponse } from '../server/api/services/FlatCommentData';

export async function parseFromFile(filename: string): Promise<BilibiliCommentData[]> {
  const data = readFileSync(filename);
  const xmlData = await parseStringPromise(data);
  const commentsErrors = new Map();
  const commentsData = xmlData.i.d
    .map((commentElement: any) => {
      if (!commentElement._ || !commentElement.$) {
        return null;
      }
      try {
        return parseFromXmlLine(commentElement.$.p, commentElement._);
      } catch (e) {
        let commentsErrorCount = commentsErrors.get(e.message);
        if (commentsErrorCount == null) {
          commentsErrorCount = 1;
        } else {
          commentsErrorCount++;
        }
        commentsErrors.set(e.message, commentsErrorCount);

        return null;
      }
    })
    .filter(validCommentData);

  console.error(commentsErrors);

  return commentsData;
}

function validCommentData(data: BilibiliCommentData | null): data is BilibiliCommentData {
  return !!data;
}

export function parseFromXmlLine(attributes: string, text: string): BilibiliCommentData | null {
  // Parse metadata
  const indexMetadata = text.lastIndexOf(metadataDelimiter);
  if (indexMetadata === -1) {
    throw new TypeError('Missing metadata delimiter');
  }

  const metadataText = text.slice(indexMetadata + metadataDelimiter.length);
  let properties = [];
  for (let i = 0; i < metadataText.length; i++) {
    properties.push(metadataText.charCodeAt(i));
  }

  properties = toActualCharCodes(properties);

  // Skip validation
  properties = properties.slice(0, -1);

  // Parse comment text
  const commentText = text.slice(0, indexMetadata);

  // Parse properties
  let coordinateX;
  let coordinateY;
  const buffData: any = {};
  if (properties.length === 2) {
    [coordinateX, coordinateY] = properties;
  } else if (properties.length === 4) {
    let buffType;
    let buffParameter;
    [coordinateX, coordinateY, buffType, buffParameter] = properties;
    if (BuffType[buffType] != null) {
      buffData.type = buffType;
      buffData.parameter = buffParameter;
    }
  } else {
    throw new TypeError(`Unknown properties: ${properties}`);
  }

  // Parse attributes
  const [, , size, color, sentAt, , userId] = attributes.split(',');

  const sentAtMs = Number(sentAt) * 1000;
  return {
    size: Number(size),
    color: Number(color),
    text: commentText,
    coordinateX,
    coordinateY,
    buffType: buffData.type,
    buffParameter: buffData.parameter,
    createdAt: sentAtMs,
    sentAt: sentAtMs,
    userId,
  };
}

const metadataDelimiter = '/[';

// Thanks @UHI for av488629
// every char code in the string must be in [0, 0x8000)
function toActualCharCodes(codes: number[]): number[] {
  if (
    !codes.every((code) => (code >= 0x4000 && code <= 0x9fff) || (code >= 0xb000 && code <= 0xcfff))
  ) {
    throw new Error(`Invalid char codes: ${codes}`);
  }
  return codes.map((code) => code - (code < 0xb000 ? 0x4000 : 0x5000));
}

export interface BilibiliCommentData extends FlatCommentDataResponse {
  readonly sentAt: number;
  readonly userId: string;
}
