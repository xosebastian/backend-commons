import { PassThrough } from 'stream';
import { GcpLoggerService, als } from './gcp-logger.service';

describe('GcpLoggerService', () => {
  const createLogger = () => {
    const stream = new PassThrough();
    const logs: any[] = [];
    stream.on('data', (chunk) => {
      const lines = chunk
        .toString()
        .split('\n')
        .filter(Boolean);
      for (const line of lines) {
        logs.push(JSON.parse(line));
      }
    });
    const logger = new GcpLoggerService({ serviceName: 'test', env: 'production' }, stream);
    return { logger, logs };
  };

  it('maps levels to severity', () => {
    const { logger, logs } = createLogger();
    logger.error('boom');
    expect(logs[0].severity).toBe('ERROR');
  });

  it('includes trace and spanId from async local storage', () => {
    const { logger, logs } = createLogger();
    als.run({ trace: 'trace-1', spanId: 'span-1' }, () => {
      logger.log('hello');
    });
    expect(logs[0]['logging.googleapis.com/trace']).toBe('trace-1');
    expect(logs[0]['logging.googleapis.com/spanId']).toBe('span-1');
  });
});
