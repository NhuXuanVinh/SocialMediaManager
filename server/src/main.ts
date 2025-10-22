import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: '12345',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false,
        sameSite: 'lax',
      },
    }),
  );

  app.enableCors();
  app.setGlobalPrefix('api');

  // Deprecated Sequelize bootstrap removed after migrating to TypeORM

  // Ensure uploads directory exists for multer
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
}

bootstrap();
