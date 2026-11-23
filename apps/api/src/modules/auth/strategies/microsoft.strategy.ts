import { Env } from '@/common/config/env';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, VerifyCallback } from 'passport-oauth2';
import { AuthProvider } from '../interface/auth.interface';
import { AuthService } from '@/modules/auth/auth.service';

interface GraphMe {
  id: string;
  displayName?: string;
  mail?: string;
}

// tenants whose users are not controlled by a single organization
const MULTI_TENANT = ['common', 'organizations', 'consumers'];

// Microsoft Entra ID (Azure AD) via OAuth 2.0 authorization code flow
@Injectable()
export class MicrosoftStrategy extends PassportStrategy(
  Strategy,
  'microsoft'
) {
  private readonly singleTenant: boolean;

  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const tenant =
      configService.get<Env['MICROSOFT_TENANT_ID']>('MICROSOFT_TENANT_ID');
    const base = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0`;
    super({
      authorizationURL: `${base}/authorize`,
      tokenURL: `${base}/token`,
      clientID: configService.get<Env['MICROSOFT_CLIENT_ID']>(
        'MICROSOFT_CLIENT_ID'
      ),
      clientSecret: configService.get<Env['MICROSOFT_CLIENT_SECRET']>(
        'MICROSOFT_CLIENT_SECRET'
      ),
      callbackURL: `${configService.get<Env['PUBLIC_BASE_APP_URL']>(
        'PUBLIC_BASE_APP_URL'
      )}/auth/microsoft/callback`,
      scope: ['openid', 'profile', 'email', 'User.Read'],
      state: true,
    } satisfies StrategyOptions);
    this.singleTenant = !MULTI_TENANT.includes(tenant);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    _profile: unknown,
    done: VerifyCallback
  ) {
    try {
      const res = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch Microsoft profile');
      const me = (await res.json()) as GraphMe;
      const user = await this.authService.handleOAuthCallback({
        name: me.displayName,
        // `mail` only; userPrincipalName is not guaranteed to be a real mailbox
        email: me.mail,
        // Entra emails are not verified by Microsoft; only trust them when the
        // app is locked to a single tenant whose admin owns the addresses
        emailVerified: this.singleTenant && !!me.mail,
        avatar_url: undefined, // Graph photo needs a separate binary call
        provider: AuthProvider.MICROSOFT,
        providerAccountId: me.id,
      });
      done(null, user);
    } catch (e) {
      done(e as Error);
    }
  }
}
