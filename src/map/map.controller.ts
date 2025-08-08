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
import { Token } from '../token/token.entity';

@Controller('maps')
export class MapController {
  
  constructor(
    @InjectRepository(Map)
    private mapRepository: Repository<Map>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  // 모든 맵 조회
  @Get()
  async getAllMaps() {
    return await this.mapRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  // 특정 맵 조회 (토큰들 포함)
  @Get(':id')
  async getMap(@Param('id', ParseIntPipe) id: number) {
    return await this.mapRepository.findOne({
      where: { id },
      relations: ['tokens']
    });
  }

  // ✅ 방별 맵 목록 조회
  @Get('room/:roomId')
  async getMapsByRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    return await this.mapRepository.find({
      where: { roomId: roomId },
      order: { createdAt: 'ASC' }
    });
  }

  // ✅ 방에 새 맵 추가
  @Post('room/:roomId')
  async createMapForRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() createMapDto: any
  ) {
    const map = this.mapRepository.create();
    map.name = createMapDto.name || '새 맵';
    map.width = createMapDto.width || 1000;
    map.height = createMapDto.height || 800;
    map.backgroundImage = createMapDto.backgroundImage;
    map.properties = createMapDto.properties || {};
    map.isActive = createMapDto.isActive || false;
    map.roomId = roomId;

    return await this.mapRepository.save(map);
  }

  // ✅ 맵 업데이트
  @Put(':id')
  async updateMap(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMapDto: any
  ) {
    // 엔티티를 먼저 조회해서 업데이트
    const map = await this.mapRepository.findOne({ where: { id } });
    if (!map) {
      throw new Error('맵을 찾을 수 없습니다.');
    }

    // 필드별 업데이트
    if (updateMapDto.name !== undefined) map.name = updateMapDto.name;
    if (updateMapDto.width !== undefined) map.width = updateMapDto.width;
    if (updateMapDto.height !== undefined) map.height = updateMapDto.height;
    if (updateMapDto.backgroundImage !== undefined) map.backgroundImage = updateMapDto.backgroundImage;
    if (updateMapDto.properties !== undefined) map.properties = updateMapDto.properties;
    if (updateMapDto.isActive !== undefined) map.isActive = updateMapDto.isActive;
    if (updateMapDto.roomId !== undefined) map.roomId = updateMapDto.roomId;

    return await this.mapRepository.save(map);
  }

  // ✅ 맵 활성화 (현재 맵으로 설정)
  @Put(':id/activate')
  async activateMap(
    @Param('id', ParseIntPipe) id: number,
    @Body('roomId') roomId: number
  ) {
    // 같은 방의 다른 맵들 비활성화
    await this.mapRepository
      .createQueryBuilder()
      .update(Map)
      .set({ isActive: false })
      .where('roomId = :roomId', { roomId })
      .execute();
    
    // 현재 맵 활성화
    const map = await this.mapRepository.findOne({ where: { id } });
    if (map) {
      map.isActive = true;
      await this.mapRepository.save(map);
    }
    
    return { success: true, message: '맵이 활성화되었습니다.' };
  }

  // 맵 삭제
  @Delete(':id')
  async deleteMap(@Param('id', ParseIntPipe) id: number) {
    return await this.mapRepository.delete(id);
  }
}