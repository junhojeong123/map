import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  filename: string;

  @Column()
  originalname: string;

  // 우선도(순서) 필드 추가
  @Column({ type: 'integer', default: 0 })
  priority: number;

  //  Z-index (CSS 레이어 순서)
  @Column({ type: 'integer', default: 0 })
  zIndex: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;
}