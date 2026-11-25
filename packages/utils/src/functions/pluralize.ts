const UNCOUNTABLE = new Set(['sheep', 'fish', 'series', 'species', 'deer']);

const endsWithConsonantY = (word: string) => /[^aeiou]y$/i.test(word);

/**
 * Pluralize an English noun for a given count.
 *
 * @param word - singular noun
 * @param count - how many; 1 keeps the singular
 * @param options.plural - override for irregular nouns
 */
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

  if (options.plural !== undefined && options.plural !== '') {
    // Explicit plural always wins, even for words we would otherwise inflect.
    return options.plural;
  }

  // Uncountable nouns never change.
  if (UNCOUNTABLE.has(word.toLowerCase())) {
    return word;
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
