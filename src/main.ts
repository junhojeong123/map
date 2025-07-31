import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app: any = await NestFactory.create(AppModule);
  
  // CORS 허용
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // uploads 폴더를 정적 파일로 제공 (이미지)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // public 폴더를 정적 파일로 제공 (HTML)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  await app.listen(3000);
  console.log('서버가 http://localhost:3000 에서 실행 중입니다!');
}
bootstrap();