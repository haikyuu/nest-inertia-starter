import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RESPONSE_PASSTHROUGH_METADATA } from '@nestjs/common/constants';

export const Inertia = (): ParameterDecorator => {
  return (target, key, index) => {
    Reflect.defineMetadata(
      RESPONSE_PASSTHROUGH_METADATA,
      false,
      target.constructor,
      key,
    );
    return createParamDecorator((data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.Inertia;
    })()(target, key, index);
  };
};

/**
 * 
 * 
export const Inertia = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.Inertia;
  },
  [
    (target, key) => {
      Reflect.defineMetadata(
        RESPONSE_PASSTHROUGH_METADATA,
        false,
        target.constructor,
        key,
      );
    },
  ],
);

 */
