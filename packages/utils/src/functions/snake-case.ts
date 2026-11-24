// From camelCase, PascalCase, kebab-case or spaced words to lower_snake_case
export const snakeCase = (str: string) =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
