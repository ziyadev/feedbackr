import { Injectable, Logger } from '@nestjs/common';
import { IToken } from './token.interface';
import { randomBytes } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import { TokenRepository } from '../database/repositories/token.repository';

@Injectable()
export class TokenService {
  private logger = new Logger(TokenService.name);
  constructor(private readonly tokenRepository: TokenRepository) {}
  get userLoginToken(): IToken {
    return {
      generate: async (userId) => {
        try {
          const token = `${uuidv4()}-${randomBytes(16).toString('hex')}`;
          await this.tokenRepository.create({
            data: {
              identifier: userId,
              token,
              type: 'LOGIN',
              expires: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
            },
          });
          return token;
        } catch (e) {
          this.logger.error('Failed to generate token', e.message);
          throw new Error('Something went wrong');
        }
      },
      validate: async (token) => {
        const findToken = await this.tokenRepository.findFirst({
          where: {
            token,
            type: 'LOGIN',
          },
        });
        if (!findToken || findToken.expires < new Date()) {
          return false;
        }
        return true;
      },
    };
  }
  get userResetPasswordToken(): IToken {
    return {
      generate: async (userId) => {
        try {
          const token = `${uuidv4()}-${randomBytes(16).toString('hex')}`;
          await this.tokenRepository.create({
            data: {
              identifier: userId,
              token,
              type: 'RESET_PASSWORD',
              expires: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes
            },
          });
          return token;
        } catch (e) {
          this.logger.error('Failed to generate token', e.message);
          throw new Error('Something went wrong');
        }
      },
      validate: async (token) => {
        const findToken = await this.tokenRepository.findFirst({
          where: {
            token,
            type: 'RESET_PASSWORD',
          },
        });
        if (!findToken || findToken.expires < new Date()) {
          return false;
        }
        return true;
      },
    };
  }
  /** Single-use: returns the user id for a valid, unexpired reset token and deletes it. */
  async consumeResetPasswordToken(token: string): Promise<string | null> {
    const found = await this.tokenRepository.findFirst({
      where: { token, type: 'RESET_PASSWORD' },
    });
    if (!found || found.expires < new Date()) return null;
    const { count } = await this.tokenRepository.deleteMany({
      where: { token, type: 'RESET_PASSWORD' },
    });
    return count === 1 ? found.identifier : null;
  }
}
