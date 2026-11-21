import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthStrategy } from './auth.strategy';

@Injectable()
export class SessionStrategy extends AuthStrategy {
  constructor() {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const request = this.getRequest(context);
    const user = request.session.user;
    // sessions created before the hash leak fix may still hold hashedPassword
    if (user && 'hashedPassword' in user) {
      await new Promise<void>((resolve) =>
        request.session.destroy(() => resolve())
      );
      return false;
    }
    return !!user;
  }
}
