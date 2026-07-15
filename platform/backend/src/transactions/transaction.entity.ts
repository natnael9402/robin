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
import { Trade } from '../trades/trade.entity';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'bigint', nullable: true, name: 'trade_id' })
  tradeId: number | null;

  @Column({ length: 255 })
  type: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ length: 255, default: 'USDT' })
  currency: string;

  @Column('decimal', { precision: 15, scale: 2 })
  balance: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Trade, (trade) => trade.transactions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'trade_id', referencedColumnName: 'id' })
  trade: Trade;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
