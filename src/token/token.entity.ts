import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Image } from '../image/image.entity';
import { Map } from '../map/map.entity';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  x: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  y: number;

  @Column({ type: 'integer', default: 0 })
  rotation: number;

  @Column({ type: 'integer', default: 100 })
  width: number;

  @Column({ type: 'integer', default: 100 })
  height: number;

  @Column({ type: 'integer', default: 0 })
  zIndex: number;

  @Column({ type: 'jsonb', nullable: true })
  stats: any;

  @Column({ type: 'jsonb', nullable: true })
  properties: any;

  // 이미지와 연결
  @ManyToOne(() => Image, { eager: true, nullable: true })
  @JoinColumn()
  image: Image;

  // 맵과 연결
  @ManyToOne(() => Map, map => map.tokens, { onDelete: 'CASCADE' })
  @JoinColumn()
  map: Map;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}