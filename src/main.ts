import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  void ConfigModule.forRoot({
    isGlobal: true,
  });
  const url = process.env.PAYMENT_SERVICE_URL || '0.0.0.0:50056';
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'payment',
      protoPath: join(__dirname, '../payment.proto'),
      url: url,
    },
  });
  app.enableShutdownHooks();
  await app.listen();
  console.log(`Payment microservice is running on ${url}`);
}
void bootstrap();
