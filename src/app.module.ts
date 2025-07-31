// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './image/image.entity';
import { UploadController } from './upload/upload.controller';
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'chat_app',
      entities: [Image],  
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([Image]),  
  ],
  controllers: [AppController, UploadController],
  providers: [],  
})
export class AppModule {}