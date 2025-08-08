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
import { Token } from './token.entity';
import { TokenGateway } from './token.gateway'; // 추가

@Controller('tokens')
export class TokenController {
  
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private tokenGateway: TokenGateway, // 추가
  ) {}

  // 토큰 위치 변경 API - WebSocket 알림 추가
  @Put(':id/position')
  async updateTokenPosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() positionDto: { x: number; y: number; rotation?: number; mapId?: number }
  ) {
    await this.tokenRepository.update(id, {
      x: positionDto.x,
      y: positionDto.y,
      rotation: positionDto.rotation
    });
    
    const updatedToken = await this.tokenRepository.findOne({
      where: { id },
      relations: ['image', 'map']
    });
    
    // ✅ WebSocket으로 실시간 알림
    if (updatedToken && positionDto.mapId) {
      this.tokenGateway.server.to(`map_${positionDto.mapId}`).emit('tokenUpdated', updatedToken);
    }
    
    return updatedToken;
  }

  // 토큰 생성 API - WebSocket 알림 추가
  @Post()
  async createToken(@Body() createTokenDto: any) {
    const token = this.tokenRepository.create({
      name: createTokenDto.name || '토큰',
      x: createTokenDto.x || 0,
      y: createTokenDto.y || 0,
      rotation: createTokenDto.rotation || 0,
      width: createTokenDto.width || 100,
      height: createTokenDto.height || 100,
      zIndex: createTokenDto.zIndex || 0,
      stats: createTokenDto.stats || {},
      properties: createTokenDto.properties || {},
      image: createTokenDto.imageId ? { id: createTokenDto.imageId } : null,
      map: createTokenDto.mapId ? { id: createTokenDto.mapId } : null
    });

    const savedToken = await this.tokenRepository.save(token);
    
    // ✅ WebSocket으로 실시간 알림
    if (createTokenDto.mapId) {
      this.tokenGateway.server.to(`map_${createTokenDto.mapId}`).emit('tokenAdded', savedToken);
    }
    
    return savedToken;
  }

  // 토큰 삭제 API - WebSocket 알림 추가
  @Delete(':id')
  async deleteToken(@Param('id', ParseIntPipe) id: number) {
    const token = await this.tokenRepository.findOne({ where: { id } });
    
    if (token) {
      await this.tokenRepository.delete(id);
      
      // ✅ WebSocket으로 실시간 알림
      if (token.map) {
        this.tokenGateway.server.to(`map_${token.map.id}`).emit('tokenRemoved', id);
      }
    }
    
    return { success: true };
  }
}