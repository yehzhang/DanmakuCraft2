class RegisteredTimes {
  static readonly MAX = Infinity;

  constructor(public registeredTimes: number = 0) {
  }

  isNew() {
    return this.registeredTimes <= 1;
  }

  isRegisteredAfterGenesis() {
    return this.registeredTimes < RegisteredTimes.MAX;
  }
}

export default RegisteredTimes;
