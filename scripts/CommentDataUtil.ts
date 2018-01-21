import {BuffType} from '../client/src/entitySystem/system/buff/BuffData';
import {FlatCommentData} from '../client/src/comment/CommentData';

class CommentDataUtil {
  static readonly METADATA_DELIMITER = '/[';

  static parseFromDocument(document: Document): BilibiliCommentData[] {
    return Array.from(document.getElementsByTagName('d'))
        .map(commentElement => {
          let attributes = commentElement.attributes.getNamedItem('p').value;
          let text = commentElement.textContent || '';
          try {
            return this.parseFromXmlLine(attributes, text);
          } catch {
            return null;
          }
        })
        .filter(Boolean) as BilibiliCommentData[];
  }

  static parseFromXmlLine(attributes: string, text: string): BilibiliCommentData | null {
    // Parse metadata
    let indexMetadata = text.lastIndexOf(this.METADATA_DELIMITER);
    if (indexMetadata === -1) {
      throw new TypeError('Missing metadata delimiter');
    }

    let metadataText = text.slice(indexMetadata + this.METADATA_DELIMITER.length);
    let properties = [];
    for (let i = 0; i < metadataText.length; i++) {
      properties.push(metadataText.charCodeAt(i));
    }

    properties = this.toActualCharCodes(properties);

    // Skip validation
    properties = properties.slice(0, -1);

    // Parse comment text
    let commentText = text.slice(0, indexMetadata);

    // Parse properties
    let coordinateX;
    let coordinateY;
    let buffData: any = {};
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
    let [, , size, color, sentAt, , userId] = attributes.split(',');

    return {
      size: Number(size),
      color: Number(color),
      text: commentText,
      coordinateX,
      coordinateY,
      buffType: buffData.type,
      buffParameter: buffData.parameter,
      sentAt: Number(sentAt),
      userId,
    };
  }

  // Thanks @UHI for av488629
  // every char code in the string must be in [0, 0x8000)
  private static toActualCharCodes(codes: number[]): number[] {
    if (!codes.every(
            code => (code >= 0x4000 && code <= 0x9fff) || (code >= 0xb000 && code <= 0xcfff))) {
      throw new Error(`Invalid char codes: ${codes}`);
    }
    return codes.map(code => code - (code < 0xb000 ? 0x4000 : 0x5000));
  }
}

export default CommentDataUtil;

export interface BilibiliCommentData extends FlatCommentData {
  readonly sentAt: number;
  readonly userId: string;
}
