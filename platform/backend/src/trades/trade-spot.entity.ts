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

@Entity({ name: 'trade_spots' })
export class TradeSpot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'trade_id' })
  tradeId: number;

  @Column('decimal', { precision: 15, scale: 8 })
  quantity: number;

  @Column('decimal', { precision: 15, scale: 8, name: 'market_price' })
  marketPrice: number;

  @Column('decimal', { precision: 20, scale: 12, nullable: true, name: 'exchange_rate' })
  exchangeRate: number | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'from_coin' })
  fromCoin: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'to_coin' })
  toCoin: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Trade, (trade) => trade.spots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trade_id', referencedColumnName: 'id' })
  trade: Trade;
}