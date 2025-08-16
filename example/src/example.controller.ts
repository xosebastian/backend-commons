import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  AppConfigService,
  GcpLoggerService,
  RequestContextService,
  ValidationPipe,
  AppError,
  ERROR_CODES,
  retry,
} from '@epago/backend-commons';
import { IsString } from 'class-validator';

class EchoDto {
  @IsString()
  message!: string;
}

@Controller()
export class ExampleController {
  constructor(
    private readonly logger: GcpLoggerService,
    private readonly config: AppConfigService,
    private readonly context: RequestContextService,
  ) {}

  @Get('hello')
  getHello() {
    const ctx = this.context.getContext();
    this.logger.log({ msg: 'hello', requestId: ctx?.requestId });
    return { hello: 'world', requestId: ctx?.requestId };
  }

  @Get('config')
  getConfig() {
    return this.config.getAll();
  }

  @Post('echo')
  async echo(@Body(new ValidationPipe()) dto: EchoDto) {
    return dto;
  }

  @Get('error')
  getError() {
    throw new AppError('Not found', { code: ERROR_CODES.NOT_FOUND });
  }

  @Get('retry')
  async getRetry() {
    const attempt = await retry(async () => {
      if (Math.random() < 0.7) {
        throw new Error('random fail');
      }
      return 'ok';
    }, { retries: 3, delayMs: 10 });
    return attempt;
  }
}
