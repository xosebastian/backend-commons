import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

export interface RequestContext {
  readonly requestId: string;
  readonly traceId?: string;
  readonly userId?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Provides per-invocation context using AsyncLocalStorage.
 */
@Injectable()
export class RequestContextService {
  private readonly storage: AsyncLocalStorage<RequestContext> = new AsyncLocalStorage<RequestContext>();

  public runInContext<T>(context: Partial<RequestContext>, callback: () => T): T {
    const base: RequestContext = {
      requestId: context.requestId ?? randomUUID(),
      traceId: context.traceId,
      userId: context.userId,
      metadata: context.metadata ?? {},
    };
    return this.storage.run(base, callback);
  }

  public getContext(): RequestContext | undefined {
    return this.storage.getStore();
  }
}

