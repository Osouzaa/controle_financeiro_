import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type RequestUser = {
  sub: string;
  email: string;
};

export const AuthUser = createParamDecorator((_: unknown, ctx: ExecutionContext): RequestUser => {
  return ctx.switchToHttp().getRequest().user;
});
