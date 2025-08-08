import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Token } from '../token/token.entity';

@Entity()
export class Map {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'integer', default: 1000 })
  width: number;

  @Column({ type: 'integer', default: 800 })
  height: number;

  @Column({ type: 'text', nullable: true })
  backgroundImage: string;

  // ✅ 방 ID 추가 (기존 세션 시스템과 연동)
  @Column({ type: 'integer' })  // 또는 문자열 타입에 맞게 수정
  roomId: number;  // 또는 sessionId, gameId 등 기존 필드명에 맞게

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  properties: any;

  @OneToMany(() => Token, token => token.map)
  tokens: Token[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}