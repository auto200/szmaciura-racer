export const getInputMaxLength = (activeWord: string): number => {
  const length = activeWord.length * 2;
  return length >= 8 ? length : 8;
};
