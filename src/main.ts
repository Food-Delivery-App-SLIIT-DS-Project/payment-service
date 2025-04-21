import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'payment',
      protoPath: join(__dirname, '../payment.proto'),
      url: '0.0.0.0:50056',
    },
  });
  app.enableShutdownHooks();
  await app.listen();
  console.log('Payment service is running on: http://localhost:50056');
}
void bootstrap();
