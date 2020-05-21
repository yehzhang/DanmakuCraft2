function existsObject<T extends object>(value: T | false | null | undefined): value is T {
  return !!value;
}

export default existsObject;
