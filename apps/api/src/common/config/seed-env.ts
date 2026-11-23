export function getSeedUserPassword(
  env: Record<string, string | undefined> = process.env
): string {
  const password = env.SEED_USER_PASSWORD;
  if (!password) {
    throw new Error('SEED_USER_PASSWORD must be set to run the user seed');
  }
  return password;
}
