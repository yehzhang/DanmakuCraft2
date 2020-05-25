class ParametricTypeError extends TypeError {
  constructor(message: string, readonly details: { readonly [key: string]: unknown }) {
    super(message);
    // Hack to get `instanceof` work in TypeScript.
    Object.setPrototypeOf(this, ParametricTypeError.prototype);
  }
}

export default ParametricTypeError;
