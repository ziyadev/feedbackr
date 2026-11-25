const UNCOUNTABLE = new Set(['sheep', 'fish', 'series', 'species', 'deer']);

const endsWithConsonantY = (word: string) => /[^aeiou]y$/i.test(word);

/**
 * Returns the singular or plural form of an English word depending on a count.
 *
 * Regular rules handled: uncountable nouns (sheep, fish, series, species, deer)
 * never change; consonant + "y" becomes "ies"; words ending in s, x, z, ch or sh
 * get "es"; everything else gets "s". Irregular plurals are not inferred, so
 * pass them explicitly via `options.plural`.
 *
 * @param word - The singular form of the word.
 * @param count - The quantity. Exactly `1` returns `word` unchanged; any other
 * value (including 0 and negatives) returns the plural.
 * @param options - Optional settings.
 * @param options.plural - Explicit plural form. When non-empty it takes
 * precedence over all built-in rules (used when `count !== 1`).
 * @returns `word` when `count === 1`, otherwise its plural form.
 *
 * @example
 * pluralize('city', 2); // 'cities'
 * pluralize('box', 3); // 'boxes'
 * pluralize('sheep', 5); // 'sheep'
 * pluralize('item', 1); // 'item'
 *
 * @example
 * // Irregular plurals: supply the plural explicitly
 * pluralize('child', 2, { plural: 'children' }); // 'children'
 * pluralize('person', 3, { plural: 'people' }); // 'people'
 * pluralize('child', 1, { plural: 'children' }); // 'child'
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
