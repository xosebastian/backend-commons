import { Module } from '@nestjs/common';
import { AppConfigModule, GcpLoggerModule, RequestContextModule } from '@epago/backend-commons';
import { ExampleController } from './example.controller';

@Module({
  imports: [
    AppConfigModule,
    GcpLoggerModule.forRoot({ serviceName: 'example-app' }),
    RequestContextModule,
  ],
  controllers: [ExampleController],
})
export class AppModule {}
