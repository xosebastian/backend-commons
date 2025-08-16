import { MockLoggerService } from './mock-logger.service';

describe('MockLoggerService', () => {
  it('records messages by level', () => {
    const logger = new MockLoggerService();
    logger.log('info');
    logger.error('error', { detail: true });
    logger.warn('warn');
    logger.debug('debug');
    logger.verbose('verbose');

    expect(logger.logs).toEqual([[ 'info' ]]);
    expect(logger.errors).toEqual([[ 'error', { detail: true } ]]);
    expect(logger.warnings).toEqual([[ 'warn' ]]);
    expect(logger.debugs).toEqual([[ 'debug' ]]);
    expect(logger.verboses).toEqual([[ 'verbose' ]]);
  });
});
