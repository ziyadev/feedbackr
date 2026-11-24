// From camelCase, PascalCase, snake_case or spaced words to kebab-case
export const kebabCase = (str: string) =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
