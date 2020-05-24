function buildCommand(words: readonly (string | null | undefined | false)[]): string {
  return words.filter(Boolean).join(' ');
}

export default buildCommand;
