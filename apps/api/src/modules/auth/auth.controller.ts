import { Session } from '@/common/decorators/session.decorator';
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { SessionData } from 'express-session';
import { AuthService } from './auth.service';
import { Auth } from './decorator/auth.decorator';
import { GithubOAuthGuard } from './guard/github.guard';
import { GoogleOAuthGuard } from './guard/google.guard';
import { TwitterOAuthGuard } from './guard/twitter.guard';
import { UserEntity } from '../user/entities/user.entity';
import { buildOauthRedirectUrl } from './utils/build-oauth-redirect-url';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Auth()
  @Get('session')
  session(@Session() session: SessionData) {
    return {
      session: {
        user: session.user && {
          id: session.user.id,
          email: session.user.email,
          emailVerified: session.user.emailVerified,
          planId: session.user.planId,
        },
        workspace: session.workspace,
      },
    };
  }
  @UseGuards(GoogleOAuthGuard)
  @Get('google')
  google() {
    return;
  }

  @UseGuards(GoogleOAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session
  ) {
    await this.authService.saveSession(session, req.user as UserEntity);
    res.redirect(buildOauthRedirectUrl(req));
  }
  @UseGuards(GithubOAuthGuard)
  @Get('github')
  github() {
    return;
  }

  @UseGuards(GithubOAuthGuard)
  @Get('github/callback')
  async githubCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session
  ) {
    await this.authService.saveSession(session, req.user as UserEntity);
    res.redirect(buildOauthRedirectUrl(req));
  }

  @UseGuards(TwitterOAuthGuard)
  @Get('twitter')
  twitter() {
    return;
  }

  @UseGuards(TwitterOAuthGuard)
  @Get('twitter/callback')
  async twitterCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session
  ) {
    await this.authService.saveSession(session, req.user as UserEntity);
    res.redirect(buildOauthRedirectUrl(req));
  }

  @Post('sign-out')
  async signOut(@Req() req: Request) {
    return req.session.destroy(() => console.log('session destroyed'));
  }
}
