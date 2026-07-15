import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'assets' })
export class UserAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 20 })
  symbol: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string | null;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number;

  @Column('decimal', { precision: 20, scale: 8, nullable: true, name: 'current_price' })
  currentPrice: number | null;

  @Column('decimal', { precision: 20, scale: 2, nullable: true, name: 'current_value' })
  currentValue: number | null;

  @Column('decimal', { precision: 20, scale: 8, nullable: true, name: 'avg_purchase_price' })
  avgPurchasePrice: number | null;

  @Column({ type: 'timestamp', nullable: true, name: 'last_updated_at' })
  lastUpdatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
