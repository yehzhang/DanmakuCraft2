function checkExhaustive(value: never) {
  console.error('Unexpected inexhaustive check', value);
}

export default checkExhaustive;
