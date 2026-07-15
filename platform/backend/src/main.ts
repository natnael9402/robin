import { Logger, Module, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);
  const port: number = (config.get<number>('app.port') as number | undefined) ?? 3000;

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'https://zent-admin-one.vercel.app',
      'https://sami-platform.vercel.app',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://zent-alpha.vercel.app',
      /\.vercel\.app$/,
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(port);
  Logger.log(`Zent backend listening on :${port}`, 'Bootstrap');
}

void bootstrap();
