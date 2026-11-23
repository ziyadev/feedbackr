export enum AuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  TWITTER = 'twitter',
}

export interface OAuthUser {
  provider: AuthProvider;
  providerAccountId: string;
  name: string;
  email: string;
  avatar_url: string;
  /** whether the provider verified this email address */
  emailVerified: boolean;
}
