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

@Entity({ name: 'trade_contracts' })
export class TradeContract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'trade_id' })
  tradeId: number;

  @Column('decimal', { precision: 15, scale: 8 })
  quantity: number;

  @Column({ type: 'int' })
  leverage: number;

  @Column('decimal', { precision: 15, scale: 8, name: 'liquidation_price' })
  liquidationPrice: number;

  @Column('decimal', { precision: 15, scale: 8, nullable: true, name: 'take_profit' })
  takeProfit: number | null;

  @Column('decimal', { precision: 15, scale: 8, nullable: true, name: 'stop_loss' })
  stopLoss: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Trade, (trade) => trade.contracts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trade_id', referencedColumnName: 'id' })
  trade: Trade;
}