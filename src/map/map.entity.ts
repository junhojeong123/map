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
  backgroundImage: string; // 배경 이미지 URL

  @Column({ type: 'jsonb', nullable: true })
  properties: any; // 커스텀 속성

  @OneToMany(() => Token, token => token.map)
  tokens: Token[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}