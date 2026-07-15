import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Trade } from './trade.entity';

@Entity({ name: 'trade_options' })
export class TradeOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'trade_id' })
  tradeId: number;

  @Column({ type: 'int' })
  duration: number;

  @Column('decimal', { precision: 5, scale: 2, name: 'return_rate' })
  returnRate: number;

  @Column('decimal', { precision: 15, scale: 2, name: 'expected_return' })
  expectedReturn: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Trade, (trade) => trade.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trade_id', referencedColumnName: 'id' })
  trade: Trade;
}