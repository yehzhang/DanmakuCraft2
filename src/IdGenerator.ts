import uuidv4 = require('uuid/v4');

export default interface IdGenerator {
  generateUniqueId(): string;
}

export class UuidGenerator implements IdGenerator {
  static generateUniqueId(): string {
    return uuidv4();
  }

  generateUniqueId(): string {
    return UuidGenerator.generateUniqueId();
  }
}
