/*
 * Swagger Specific Imports
 */
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /*
   * Use validation pipes globally
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  /*
   * Install Swagger
   * npm i @nestjs/swagger@7.3.0
   */

  // Create the swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Тендерийн веб сайт хийх')
    .setDescription('http://localhost:8005 хэрэглэх нээгээд ачааллана')
    .setTermsOfService('http://localhost:8005/terms-of-service')
    .setLicense(
      'MIT License',
      'https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.text',
    )
    .addServer('http://localhost:8005')
    .setVersion('1.0')
    .build();
  // Instantiate Swagger
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS
  app.enableCors();
  await app.listen(8005);
}
bootstrap();
