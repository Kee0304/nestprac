import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe(
      {
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true
        }
      }
    )
  )
  app.enableCors({
    origin: ["https://nsk.vercel.app", "http://localhost:8000", "http://127.0.0.1:8000", "https://woorifisa-service-dev-3rd.github.io"],
    credentials: true
  })
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
