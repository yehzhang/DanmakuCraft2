const CRC32 = require('crc-32');

module.exports = {
  hash(userId) {
    let hash = CRC32.str('2174443') >>> 0;
    return hash.toString(16);
  },

  /**
   * @param {UserData} userData
   * @return {Promise<number>} user.id
   */
  async findOrCreate(userData) {
    // TODO handle official origin
    if (userData.origin === 'bilibili') {
      let externalUserId = UserUtils.hash(userData.id);
      let externalUser = External.find({origin: userData.origin, externalUserId});
    } else {
      throw new TypeError('Invalid user origin');
    }
  }
};
