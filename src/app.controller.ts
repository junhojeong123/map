import { 
  Controller, 
  Get, 
  Delete, 
  Param, 
  ParseIntPipe,
  Patch,
  Body,
  Post
} from '@nestjs/common';
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

  // 데이터베이스에서 이미지 목록 가져오기 (우선도 순으로 정렬)
  @Get('images')
  async getImages() {
    try {
      const images = await this.imageRepository.find({
        order: {
          priority: 'ASC',      // 우선도 낮은 순서대로 (0, 1, 2...)
          uploadedAt: 'DESC',   // 우선도 같으면 최신순
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
      const image = await this.imageRepository.findOne({
        where: { id },
      });

      if (!image) {
        return { success: false, message: '이미지를 찾을 수 없습니다.' };
      }

      const filePath = join(process.cwd(), image.url);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }

      await this.imageRepository.delete(id);

      return { success: true, message: '이미지가 삭제되었습니다.' };
    } catch (error) {
      console.error('이미지 삭제 에러:', error);
      return { success: false, message: '이미지 삭제 중 오류가 발생했습니다.' };
    }
  }

  //  우선도 변경
  @Patch('images/:id/priority')
  async updatePriority(
    @Param('id', ParseIntPipe) id: number,
    @Body('priority') priority: number,
    @Body('zIndex') zIndex: number
  ) {
    try {
      const image = await this.imageRepository.findOne({
        where: { id },
      });
      
      if (!image) {
        return { success: false, message: '이미지를 찾을 수 없습니다.' };
      }

      // 우선도와 zIndex 업데이트
      image.priority = priority !== undefined ? priority : image.priority;
      image.zIndex = zIndex !== undefined ? zIndex : image.zIndex;
      
      await this.imageRepository.save(image);

      return { 
        success: true, 
        message: '우선도가 업데이트되었습니다.',
        image 
      };
    } catch (error) {
      console.error('우선도 업데이트 에러:', error);
      return { success: false, message: '우선도 업데이트 중 오류가 발생했습니다.' };
    }
  }

  //  이미지 순서 재정렬 (드래그 앤 드롭 후)
  @Post('images/reorder')
  async reorderImages(@Body('imageIds') imageIds: number[]) {
    try {
      // 우선도를 배열 순서대로 재설정 (0, 1, 2, 3...)
      for (let i = 0; i < imageIds.length; i++) {
        await this.imageRepository.update(imageIds[i], { 
          priority: i,
          zIndex: i  // CSS z-index도 함께 업데이트
        });
      }
      
      return { 
        success: true, 
        message: '이미지 순서가 업데이트되었습니다.',
        reorderedIds: imageIds
      };
    } catch (error) {
      console.error('순서 재정렬 에러:', error);
      return { success: false, message: '순서 재정렬 중 오류가 발생했습니다.' };
    }
  }

  //  특정 우선도 범위의 이미지들 가져오기
  @Get('images/priority/:min/:max')
  async getImagesByPriorityRange(
    @Param('min', ParseIntPipe) min: number,
    @Param('max', ParseIntPipe) max: number
  ) {
    try {
      const images = await this.imageRepository
        .createQueryBuilder('image')
        .where('image.priority >= :min AND image.priority <= :max', { min, max })
        .orderBy('image.priority', 'ASC')
        .getMany();
      
      return { images };
    } catch (error) {
      console.error('우선도 범위 조회 에러:', error);
      return { images: [] };
    }
  }
}