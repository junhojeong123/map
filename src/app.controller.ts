import { Controller, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './image/image.entity';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  // 데이터베이스에서 이미지 목록 가져오기
  @Get('images')
  async getImages() {
    try {
      const images = await this.imageRepository.find({
        order: {
          uploadedAt: 'DESC',
        },
      });
      
      return { images };
    } catch (error) {
      console.error('데이터베이스 조회 에러:', error);
      return { images: [] };
    }
  }

  // 이미지 삭제
  @Delete('images/:id')
  async deleteImage(@Param('id', ParseIntPipe) id: number) {
    try {
      // 데이터베이스에서 이미지 정보 찾기
      const image = await this.imageRepository.findOne({
        where: { id },
      });

      if (!image) {
        return { success: false, message: '이미지를 찾을 수 없습니다.' };
      }

      // 파일 시스템에서 이미지 파일 삭제
      const filePath = join(process.cwd(), image.url);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }

      // 데이터베이스에서 이미지 정보 삭제
      await this.imageRepository.delete(id);

      return { success: true, message: '이미지가 삭제되었습니다.' };
    } catch (error) {
      console.error('이미지 삭제 에러:', error);
      return { success: false, message: '이미지 삭제 중 오류가 발생했습니다.' };
    }
  }
}