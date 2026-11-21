import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { getRequest } from '../utils/getRequest';
import { validateRequest } from '../config/csrf.config';

@Injectable()
export class CsrfGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = getRequest(context);
    if (!validateRequest(request)) {
      throw new ForbiddenException('Invalid CSRF token');
    }
    return true;
  }
}
