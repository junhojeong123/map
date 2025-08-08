import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
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

  private clientSessions: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    console.log(`클라이언트 연결됨: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`클라이언트 연결 해제: ${client.id}`);
    this.clientSessions.delete(client.id);
  }

  // ✅ 세션 입장
  @SubscribeMessage('joinSession')
  handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string }  // 타입 명시
  ) {
    client.join(`session_${data.sessionId}`);
    this.clientSessions.set(client.id, data.sessionId);
    
    client.emit('sessionJoined', { sessionId: data.sessionId });
  }

  // 세션 퇴장
  @SubscribeMessage('leaveSession')
  handleLeaveSession(@ConnectedSocket() client: Socket) {
    const sessionId = this.clientSessions.get(client.id);
    if (sessionId) {
      client.leave(`session_${sessionId}`);
      this.clientSessions.delete(client.id);
    }
  }

  // ✅ 맵 전환
  @SubscribeMessage('switchMap')
  handleSwitchMap(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; mapId: number }  // 타입 명시
  ) {
    client.rooms.forEach(room => {
      if (room.startsWith(`map_`)) {
        client.leave(room);
      }
    });
    
    client.join(`map_${data.mapId}`);
    client.emit('mapSwitched', { mapId: data.mapId });
  }

  // ✅ 토큰 이동
  @SubscribeMessage('moveToken')
  handleMoveToken(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; mapId: number; token: any }  // 타입 명시
  ) {
    client.to(`session_${data.sessionId}`).emit('tokenMoved', data);
  }

  // 토큰 생성
  @SubscribeMessage('createToken')
  handleCreateToken(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; mapId: number; token: any }  // 타입 명시
  ) {
    client.to(`session_${data.sessionId}`).emit('tokenCreated', data);
  }

  // 토큰 삭제
  @SubscribeMessage('deleteToken')
  handleDeleteToken(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; mapId: number; tokenId: number }  // 타입 명시
  ) {
    client.to(`session_${data.sessionId}`).emit('tokenDeleted', data);
  }
}