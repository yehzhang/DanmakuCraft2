import CommentData from '../../../comment/CommentData';
import {BuffData} from '../../../entitySystem/system/buff/BuffFactory';
import Point from '../../../util/syntax/Point';

class CommentDataUtil {
  static readonly METADATA_DELIMITER = '/[';

  static parseFromXmlStrings(attributes: string, text: string): CommentData | null {
    // Parse metadata
    let indexMetadata = text.lastIndexOf(this.METADATA_DELIMITER);
    if (indexMetadata === -1) {
      return null;
    }

    let metadataText = text.slice(indexMetadata + this.METADATA_DELIMITER.length);
    let properties = [];
    for (let i = 0; i < metadataText.length; i++) {
      properties.push(metadataText.charCodeAt(i));
    }

    try {
      properties = this.toActualCharCodes(properties);
    } catch (ignored) {
      return null;
    }

    // Parse comment text
    let commentText = text.slice(0, indexMetadata);

    // Validate by MAC
    let tag = properties.pop();
    let tag2 = this.mac(commentText, properties);
    if (tag !== tag2) {
      return null;
    }

    // Parse properties
    let positionX;
    let positionY;
    let buffData;
    if (properties.length === 2) {
      [positionX, positionY] = properties;
      buffData = null;
    } else if (properties.length === 4) {
      let buffType;
      let buffParameter;
      [positionX, positionY, buffType, buffParameter] = properties;
      buffData = new BuffData(buffType, buffParameter);
    } else {
      return null;
    }

    // Parse attributes
    let [, , size, color, sendTime, , userId, ] = attributes.split(',');

    return new CommentData(
        Number(size),
        Number(color),
        commentText,
        positionX,
        positionY,
        buffData);
  }

  static buildInjectedCommentText(text: string, commentCoordinate: Point, buffData?: BuffData) {
    let metadata = this.generateCommentMetadata(text, commentCoordinate, buffData);
    return text + this.METADATA_DELIMITER + metadata;
  }

  static generateCommentMetadata(text: string, commentCoordinate: Point, buffData?: BuffData) {
    // All properties must be in [0, 0x8000)
    let properties = [
      commentCoordinate.x,
      commentCoordinate.y,
    ];

    if (buffData) {
      properties.push(buffData.type, buffData.parameter);
    }

    let tag = this.mac(text, properties);
    properties.push(tag);

    let encodedProperties = this.toSafeCharCodes(properties);

    let metadata = String.fromCharCode(...encodedProperties);

    return metadata;
  }

  private static mac(message: string, properties: number[]): number {
    // Modulo is not necessary, but keep it for compatibility.
    let firstCharCode = message.charCodeAt(0) % 0x8000;
    return this.hash(firstCharCode, ...properties);
  }

  private static hash(...codes: number[]): number {
    let ret = 0;
    codes = [44, 56, 55, 104, ...codes, 123, 99, 73, 98];  // `,87h${text}{cIb`
    for (let i = codes.length - 1; i >= 0; i--) {
      ret <<= 1;
      ret = 31 * ret + codes[i];
    }
    ret = (ret >> 15) ^ ret;
    ret %= 0x8000;
    return ret;
  }

  // Thanks @UHI for av488629
  // every char code in the string must be in [0, 0x8000)
  private static toSafeCharCodes(codes: number[]): number[] {
    if (codes.some(code => code < 0x8000)) {
      throw new Error(`Invalid char codes: ${codes}`);
    }
    return codes.map(code => (code < 0x6000 ? 0x4000 : 0x5000) + code);
  }

  private static toActualCharCodes(codes: number[]): number[] {
    if (!codes.every(
            code => (code >= 0x4000 && code <= 0x9fff) || (code >= 0xb000 && code <= 0xcfff))) {
      throw new Error(`Invalid char codes: ${codes}`);
    }
    return codes.map(code => code - (code < 0xb000 ? 0x4000 : 0x5000));
  }
}

export default CommentDataUtil;
