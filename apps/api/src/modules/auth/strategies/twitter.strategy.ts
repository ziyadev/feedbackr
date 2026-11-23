import { Env } from '@/common/config/env';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, VerifyCallback } from 'passport-oauth2';
import { AuthProvider } from '../interface/auth.interface';
import { AuthService } from '@/modules/auth/auth.service';

interface TwitterMe {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
    confirmed_email?: string;
  };
}

// Twitter uses OAuth 2.0 with PKCE
@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const clientID =
      configService.get<Env['TWITTER_CLIENT_ID']>('TWITTER_CLIENT_ID');
    const clientSecret = configService.get<Env['TWITTER_CLIENT_SECRET']>(
      'TWITTER_CLIENT_SECRET'
    );
    super({
      authorizationURL: 'https://twitter.com/i/oauth2/authorize',
      tokenURL: 'https://api.twitter.com/2/oauth2/token',
      clientID,
      clientSecret,
      callbackURL: `${configService.get<Env['PUBLIC_BASE_APP_URL']>(
        'PUBLIC_BASE_APP_URL'
      )}/auth/twitter/callback`,
      scope: ['users.read', 'tweet.read', 'users.email'],
      pkce: true,
      state: true,
      // confidential clients must authenticate with HTTP Basic
      customHeaders: {
        Authorization: `Basic ${Buffer.from(
          `${clientID}:${clientSecret}`
        ).toString('base64')}`,
      },
    } satisfies StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    _profile: unknown,
    done: VerifyCallback
  ) {
    try {
      const res = await fetch(
        'https://api.twitter.com/2/users/me?user.fields=profile_image_url,confirmed_email',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch Twitter profile');
      const { data } = (await res.json()) as TwitterMe;
      const user = await this.authService.handleOAuthCallback({
        name: data.username,
        email: data.confirmed_email,
        // Twitter only returns `confirmed_email` for confirmed addresses
        emailVerified: !!data.confirmed_email,
        avatar_url: data.profile_image_url,
        provider: AuthProvider.TWITTER,
        providerAccountId: data.id,
      });
      done(null, user);
    } catch (e) {
      done(e as Error);
    }
  }
}
