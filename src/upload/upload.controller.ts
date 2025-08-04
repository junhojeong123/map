import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../image/image.entity';

@Controller('upload')
export class UploadController {
  
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    console.log('업로드된 파일:', file);
    
    if (!file) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }

    try {
      // 데이터베이스에 이미지 정보 저장
      const image = this.imageRepository.create({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        originalname: file.originalname,
      });

      const savedImage = await this.imageRepository.save(image);

      return res.status(201).json({
        id: savedImage.id,
        url: savedImage.url,
        filename: savedImage.filename,
        originalname: savedImage.originalname,
        uploadedAt: savedImage.uploadedAt,
      });
    } catch (error) {
      console.error('데이터베이스 저장 에러:', error);
      return res.status(500).json({ error: '이미지 저장 중 오류가 발생했습니다.' });
    }
  }
}