export const combineWords = (words: string[]) => {
  if (words.length < 2) return words.join('');
  // final one should be "and" instead of comma
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
};
