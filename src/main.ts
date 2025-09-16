import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// TODO: Add logs
async function bootstrap() {
  // Application setup
  const app = await NestFactory.create(AppModule);

  // DTO Validation
  app.useGlobalPipes(new ValidationPipe());

  // Security
  app.enableCors();
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // Swagger (OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('Cocos Challenge')
    .setDescription('Broker simulation API')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Start the application
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
