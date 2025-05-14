import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // Create with raw body parsing for webhooks
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Parse JSON payloads
  // app.use(
  //   bodyParser.json({
  //     verify: (req: any, res, buf) => {
  //       req.rawBody = buf;
  //     },
  //   }),
  // );

  // Enable CORS with proper configuration
  // app.enableCors({
  //   origin: [
  //     'http://localhost:3000',
  //     'https://localhost:3000',
  //     'http://localhost:4000',
  //     'https://localhost:4000',
  //   ],
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  //   credentials: true,
  //   allowedHeaders:
  //     'Content-Type, Accept, Authorization, X-Requested-With, svix-id, svix-signature, svix-timestamp',
  // });

  // Global prefix for all API routes
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
