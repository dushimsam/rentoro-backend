import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import {
  API_BASE_PATH,
  SWAGGER_DOCUMENTATION_URL,
} from 'src/common/constants/all-constants';

export async function enableAppConfig(app: INestApplication): Promise<void> {
  app.setGlobalPrefix(API_BASE_PATH);

  app.use(helmet());

  await setupSwaggerDocumentation(app);
}

async function setupSwaggerDocumentation(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Rentoro Backend APIs')
    .setDescription('The Rentoro Backend APIs')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_DOCUMENTATION_URL, app, document, {
    swaggerOptions: {
      displayRequestDuration: true,
    },
  });
}
