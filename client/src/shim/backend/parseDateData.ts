function parseDateData(data: unknown): Date | null {
  const date = typeof data === 'string' && new Date(data);
  if (!date || isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export default parseDateData;
