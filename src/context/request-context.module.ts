import { Global, Module } from '@nestjs/common';
import { RequestContextService } from './request-context.service';

/**
 * Global module that exposes an AsyncLocalStorage-based request context.
 */
@Global()
@Module({
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class RequestContextModule {}

