import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { als } from './logger.service';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly opts: { projectId?: string } = {}) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();
    const traceHeader = req.headers['x-cloud-trace-context'] as string;
    let trace: string | undefined;
    let spanId: string | undefined;
    if (traceHeader) {
      const [traceId, span] = traceHeader.split('/');
      spanId = span?.split(';')[0];
      const projectId =
        this.opts.projectId || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
      if (projectId && traceId) {
        trace = `projects/${projectId}/traces/${traceId}`;
      }
    }

    const store = {
      requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      ...(trace ? { trace } : {}),
      ...(spanId ? { spanId } : {}),
    };

    als.run(store, () => next());
  }
}
