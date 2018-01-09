export function throwNominalTypePlaceholderError(): never {
  throw new TypeError('This method exists for nominal type check, not for calling');
}
