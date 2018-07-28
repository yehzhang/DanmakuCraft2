class RegisteredTimes {
  constructor(public registeredTimes: number = 0) {
  }

  isFirstTimeRegistered() {
    return this.registeredTimes <= 1;
  }
}

export default RegisteredTimes;
