import { forwardRef, Inject } from '@nestjs/common';

/**
 * Custom decorator for lazy dependency injection
 * Usage: @LazyImport(() => SomeService) private readonly someService: SomeService
 */
export function LazyService(serviceClass: any) {
  return Inject(forwardRef(() => serviceClass));
}

/**
 * Custom decorator for lazy module import
 * Usage: @LazyModule(() => SomeModule)
 */
export function LazyModule(moduleClass: any) {
  return forwardRef(() => moduleClass);
}
