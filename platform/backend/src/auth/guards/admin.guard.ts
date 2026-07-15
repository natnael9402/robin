import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    console.log('AdminGuard Check:', { user });
    if (user?.isAdmin) return true;
    console.warn('AdminGuard Failed: User is not admin');
    throw new ForbiddenException('Admin access required');
  }
}
