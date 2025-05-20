// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { enableAppConfig } from './configs/app.configs';
import { AppConfigService } from './configs/app-configs.service';
import { APP_NAME } from './common/constants/all-constants';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const { port, environment } = app.get(AppConfigService);

  // Configure raw body parsing for Stripe webhooks
  app.use(
    json({
      verify: (req: any, res, buf) => {
        // Make raw body available for webhook verification
        if (req.headers['stripe-signature']) {
          req.rawBody = buf;
        }
      },
    }),
  );

  await enableAppConfig(app);

  await app.listen(port, () => {
    console.warn(
      `${APP_NAME} is running on port => ${port} in ${environment} mode  🚀`,
    );
  });

  // Start gRPC microservice
  const grpcMicroservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'cars',
      protoPath: join(__dirname, 'modules/cars/proto/cars.proto'),
      url: 'localhost:50051',
    },
  });

  await app.startAllMicroservices();
  console.warn(`gRPC microservice is running on localhost:50051  микросервис запущен  🚀`);
}
bootstrap();
