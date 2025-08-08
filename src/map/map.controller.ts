import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  ParseIntPipe,
  Body 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Map } from './map.entity';

@Controller('maps')
export class MapController {
  
  constructor(
    @InjectRepository(Map)
    private mapRepository: Repository<Map>,
  ) {}

  // 맵 생성 API
  @Post()
  async createMap(@Body() createMapDto: any) {
    const map = this.mapRepository.create({
      name: createMapDto.name || '새 맵',
      width: createMapDto.width || 1000,
      height: createMapDto.height || 800,
      backgroundImage: createMapDto.backgroundImage,
      properties: createMapDto.properties || {}
    });

    return await this.mapRepository.save(map);
  }

  // 모든 맵 조회
  @Get()
  async getAllMaps() {
    return await this.mapRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  // 특정 맵 조회
  @Get(':id')
  async getMap(@Param('id', ParseIntPipe) id: number) {
    return await this.mapRepository.findOne({
      where: { id },
      relations: ['tokens'] // 토큰들 함께 조회
    });
  }

  // 맵 업데이트
  @Put(':id')
  async updateMap(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMapDto: any
  ) {
    await this.mapRepository.update(id, updateMapDto);
    return await this.mapRepository.findOne({ where: { id } });
  }

  // 맵 삭제
  @Delete(':id')
  async deleteMap(@Param('id', ParseIntPipe) id: number) {
    return await this.mapRepository.delete(id);
  }
}