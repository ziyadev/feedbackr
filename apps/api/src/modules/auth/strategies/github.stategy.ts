import { Env } from '@/common/config/env';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOption } from 'passport-github2';
import { AuthProvider } from '../interface/auth.interface';
import { AuthService } from '@/modules/auth/auth.service';
@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      clientID: configService.get<Env['GITHUB_CLIENT_ID']>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<Env['GITHUB_CLIENT_SECRET']>(
        'GITHUB_CLIENT_SECRET'
      ),
      callbackURL: `${configService.get<Env['PUBLIC_BASE_APP_URL']>(
        'PUBLIC_BASE_APP_URL'
      )}/auth/github/callback`,
      scope: ['user'],
      // needed so profile.emails carries the `verified`/`primary` flags
      allRawEmails: true,
    } satisfies StrategyOption);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: <T>(...args: T[]) => void
  ) {
    const emails = (profile.emails ?? []) as {
      value: string;
      primary?: boolean;
      verified?: boolean;
    }[];
    const email = emails.find((e) => e.primary) ?? emails[0];
    const user = await this.authService.handleOAuthCallback({
      name: profile.username,
      email: email.value,
      emailVerified: email.verified === true,
      avatar_url: profile.photos[0].value,
      provider: AuthProvider.GITHUB,
      providerAccountId: profile.id,
    });
    done(null, user);
  }
}
