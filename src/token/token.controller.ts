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
import { TokenGateway } from './token.gateway';

@Controller('tokens')
export class TokenController {
  
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private tokenGateway: TokenGateway,
  ) {}

  // 모든 토큰 조회
  @Get()
  async getAllTokens() {
    return await this.tokenRepository.find({
      order: { createdAt: 'ASC' },
      relations: ['image', 'map']
    });
  }

  // 특정 토큰 조회
  @Get(':id')
  async getToken(@Param('id', ParseIntPipe) id: number) {
    return await this.tokenRepository.findOne({
      where: { id },
      relations: ['image', 'map']
    });
  }

  // ✅ 맵별 토큰 조회
  @Get('by-map/:mapId')
  async getTokensByMap(@Param('mapId', ParseIntPipe) mapId: number) {
    return await this.tokenRepository.find({
      where: { map: { id: mapId } },
      order: { zIndex: 'ASC', createdAt: 'ASC' },
      relations: ['image']
    });
  }

// ✅ 토큰 생성
@Post()
async createToken(@Body() createTokenDto: any) {
  const token = this.tokenRepository.create();
  token.name = createTokenDto.name || '토큰';
  token.x = createTokenDto.x || 0;
  token.y = createTokenDto.y || 0;
  token.rotation = createTokenDto.rotation || 0;
  token.width = createTokenDto.width || 100;
  token.height = createTokenDto.height || 100;
  token.zIndex = createTokenDto.zIndex || 0;
  token.stats = createTokenDto.stats || {};
  token.properties = createTokenDto.properties || {};
  
  // 이미지 연결
  if (createTokenDto.imageId) {
    token.image = { id: createTokenDto.imageId } as any;
  }
  
  // 맵 연결
  if (createTokenDto.mapId) {
    token.map = { id: createTokenDto.mapId } as any;
  }

  const savedToken = await this.tokenRepository.save(token);
  
  // WebSocket으로 실시간 알림
  if (createTokenDto.mapId && createTokenDto.sessionId) {
    this.tokenGateway.server.emit('tokenCreated', {
      sessionId: createTokenDto.sessionId,
      mapId: createTokenDto.mapId,
      token: savedToken
    });
  }
  
  return savedToken;
}
  // ✅ 토큰 위치 변경
  @Put(':id/position')
  async updateTokenPosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() positionDto: { 
      x: number; 
      y: number; 
      rotation?: number;
      sessionId?: string;
      mapId?: number;
    }
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
    
    // WebSocket으로 실시간 알림
    if (positionDto.sessionId && positionDto.mapId) {
      this.tokenGateway.server.emit('tokenMoved', {
        sessionId: positionDto.sessionId,
        mapId: positionDto.mapId,
        token: updatedToken
      });
    }
    
    return updatedToken;
  }

  // 토큰 일반 업데이트
  @Put(':id')
  async updateToken(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTokenDto: any
  ) {
    await this.tokenRepository.update(id, updateTokenDto);
    return await this.tokenRepository.findOne({ 
      where: { id },
      relations: ['image', 'map']
    });
  }

  // ✅ 토큰 삭제
  @Delete(':id')
  async deleteToken(
    @Param('id', ParseIntPipe) id: number,
    @Body('sessionId') sessionId?: string,
    @Body('mapId') mapId?: number
  ) {
    const token = await this.tokenRepository.findOne({ where: { id } });
    
    if (token) {
      await this.tokenRepository.delete(id);
      
      // WebSocket으로 실시간 알림
      if (sessionId && mapId) {
        this.tokenGateway.server.emit('tokenDeleted', {
          sessionId,
          mapId,
          tokenId: id
        });
      }
    }
    
    return { success: true };
  }
}