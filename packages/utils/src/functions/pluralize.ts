const endsWithConsonantY = (word: string) => /[^aeiou]y$/i.test(word);

export const pluralize = (
  word: string,
  count: number,
  options: {
    plural?: string;
  } = {}
) => {
  if (count === 1) {
    return word;
  }

  if (options.plural) {
    return options.plural;
  }

  // city -> cities, but day -> days
  if (endsWithConsonantY(word)) {
    return `${word.slice(0, -1)}ies`;
  }

  // box -> boxes, bus -> buses, church -> churches
  if (/(s|x|z|ch|sh)$/i.test(word)) {
    return `${word}es`;
  }

  return `${word}s`;
};
