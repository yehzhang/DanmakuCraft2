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
   * @param {UserData?} userData
   * @return Promise<User>
   */
  async findOrCreate(userData) {
    if (userData != null) {
      if (userData.origin === 'bilibili' && userData.id != null) {
        return await findOrCreateBilibiliUser(userData);
      }
      // TODO handle official origin
    }

    return await findDefaultUser();
  },

  /**
   * @returns {number}
   */
  getDefaultId() {
    return DEFAULT_USER_ID;
  },
};

/**
 * @param {UserData} userData
 * @returns {Promise<User>}
 */
async function findOrCreateBilibiliUser(userData) {
  const externalUserId = UserUtils.hash(userData.id);
  let externalUser = await ExternalUser.findOne({
    origin: userData.origin,
    externalId: externalUserId,
  });

  if (externalUser == null) {
    const user = await User.create();
    try {
      externalUser = await ExternalUser.create({
        origin: userData.origin,
        externalId: externalUserId,
        correspondsTo: user,
      });
    } catch (error) {
      await user.destroy({id: user.id});

      // ExternalUser has probably been created in another request.
      externalUser = await ExternalUser.findOne({
        origin: userData.origin,
        externalId: externalUserId,
      });
      if (externalUser == null) {
        throw error;
      }
    }
  }

  // TODO why is externalUser.correspondsTo an id number instead of entity?
  return await User.findOne({id: externalUser.correspondsTo});
}

/**
 * @returns {Promise<User>}
 */
async function findDefaultUser() {
  const user = await User.findOne({id: UserUtils.getDefaultId()});
  if (user === null) {
    throw new TypeError('Default user not found');
  }
  return user;
}
