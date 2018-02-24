const CRC32 = require('crc-32');

const DEFAULT_USER_ID = 1;

module.exports = {
  /**
   * @param {string} userId
   * @returns {string}
   */
  hash(userId) {
    const hash = CRC32.str(userId) >>> 0;
    return hash.toString(16);
  },

  /**
   * @param {UserData} userData
   * @return Promise<User>
   */
  async findOrCreate(userData) {
    if (userData.origin === 'bilibili') {
      const externalUserId = UserUtils.hash(userData.id);
      const externalUser = await ExternalUser.findOrCreate({
        origin: userData.origin,
        externalId: externalUserId,
      });

      if (externalUser.correspondsTo == null) {
        const user = await User.create();

        externalUser.correspondsTo = user;
        await externalUser.save();

        return user;
      }

      return await User.findOne({id: externalUser.correspondsTo});
    }
    // TODO handle official origin

    const users = await User.findOne({id: UserUtils.getDefaultId()});
    if (users.length === 0) {
      throw new TypeError('Default user not found');
    }
    return users[0];
  },

  /**
   * @returns {number}
   */
  getDefaultId() {
    return DEFAULT_USER_ID;
  }
};
