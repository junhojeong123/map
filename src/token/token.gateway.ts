import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  }
})
export class TokenGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;

  private clients: Map<string, string> = new Map(); // clientId -> mapId

  handleConnection(client: Socket) {
    console.log(`클라이언트 연결됨: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`클라이언트 연결 해제: ${client.id}`);
    this.clients.delete(client.id);
  }

  // 클라이언트가 맵에 입장
  @SubscribeMessage('joinMap')
  handleJoinMap(client: Socket, mapId: string) {
    client.join(`map_${mapId}`);
    this.clients.set(client.id, mapId);
    console.log(`클라이언트 ${client.id}가 맵 ${mapId}에 입장`);
  }

  // 클라이언트가 맵에서 퇴장
  @SubscribeMessage('leaveMap')
  handleLeaveMap(client: Socket, mapId: string) {
    client.leave(`map_${mapId}`);
    this.clients.delete(client.id);
    console.log(`클라이언트 ${client.id}가 맵 ${mapId}에서 퇴장`);
  }

  // ✅ 토큰 위치 변경 알림 (실시간 동기화)
  @SubscribeMessage('tokenMoved')
  handleTokenMoved(client: Socket, data: { mapId: number; token: any }) {
    // 같은 맵에 있는 다른 클라이언트들에게 알림
    this.server.to(`map_${data.mapId}`).emit('tokenUpdated', data.token);
  }

  // 토큰 생성 알림
  @SubscribeMessage('tokenCreated')
  handleTokenCreated(client: Socket, data: { mapId: number; token: any }) {
    this.server.to(`map_${data.mapId}`).emit('tokenAdded', data.token);
  }

  // 토큰 삭제 알림
  @SubscribeMessage('tokenDeleted')
  handleTokenDeleted(client: Socket, data: { mapId: number; tokenId: number }) {
    this.server.to(`map_${data.mapId}`).emit('tokenRemoved', data.tokenId);
  }

  // 맵 데이터 변경 알림
  notifyMapUpdate(mapId: number, data: any) {
    this.server.to(`map_${mapId}`).emit('mapUpdated', data);
  }
}