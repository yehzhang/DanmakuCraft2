class ParametricTypeError extends TypeError {
  constructor(message: string, readonly payload: object) {
    super(message);
  }
}

export default ParametricTypeError;
