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
    origin: ['https://nextboard-eight.vercel.app/', '*'],
    credentials: true
  })
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
