module.exports.roles = {
  groups: {
    builder: [],
  },

  /**
   * @param {string} group
   * @return {UserProfile[]}
   */
  getUsers(group) {
    if (this.groups[group] == null) {
      throw new TypeError('Invalid group');
    }
    let groupNames = new Set(this.groups[group]);
    return this.userProfiles.filter(profile => groupNames.has(profile.name));
  },

  /**
   * @param {string} group
   * @return {UserProfile[]}
   */
  getUserIps(group) {
    return this.getUsers(group).map(profile => profile.ips).reduce((a, b) => a.concat(b), []);
  },
};

class UserProfile {
  /**
   * @param {string} name
   * @param {string[]} ips
   */
  constructor(name, ips) {
    this.name = name;
    this.ips = ips;
  }
}
