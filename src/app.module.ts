import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './image/image.entity';
import { Token } from './token/token.entity';
import { Map } from './map/map.entity';
import { AppController } from './app.controller';
import { UploadController } from './upload/upload.controller';
import { TokenController } from './token/token.controller';
import { MapController } from './map/map.controller';
import { TokenGateway } from './token/token.gateway'; // 추가

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'chat_app',
      entities: [Image, Token, Map],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([Image, Token, Map]),
  ],
  controllers: [AppController, UploadController, TokenController, MapController],
  providers: [TokenGateway], // 추가
})
export class AppModule {}