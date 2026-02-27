import { INestApplication, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * Configure Swagger documentation for the application
 */
export function setupSwagger(app: INestApplication): void {
  const logger = new Logger('Swagger');
  
  const config = new DocumentBuilder()
    .setTitle('Mentara API')
    .setDescription('The Mentara API documentation for the ecosystem')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  logger.log('Swagger documentation enabled at /api/docs');
}
