import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { TradeContract } from './trade-contract.entity';
import { TradeOption } from './trade-option.entity';
import { TradeSpot } from './trade-spot.entity';
import { Transaction } from '../transactions/transaction.entity';

@Entity({ name: 'trades' })
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ length: 255 })
  symbol: string;

  @Column({ length: 255 })
  type: string;

  @Column({ length: 255 })
  direction: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 15, scale: 8, name: 'entry_price' })
  entryPrice: number;

  @Column('decimal', { precision: 15, scale: 8, nullable: true, name: 'exit_price' })
  exitPrice: number | null;

  @Column('decimal', { precision: 18, scale: 8, nullable: true, name: 'exchange_rate' })
  exchangeRate: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'from_coin' })
  fromCoin: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'to_coin' })
  toCoin: string | null;

  @Column({ type: 'varchar', length: 255, default: 'open' })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  result: string | null;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  pnl: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  fee: number;

  @CreateDateColumn({ name: 'opened_at' })
  openedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'closed_at' })
  closedAt: Date | null;

  @Column({ type: 'bigint', nullable: true, name: 'closed_by' })
  closedBy: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'closed_by', referencedColumnName: 'id' })
  closer: User;

  @OneToMany(() => TradeContract, (contract) => contract.trade)
  contracts: TradeContract[];

  @OneToMany(() => TradeOption, (option) => option.trade)
  options: TradeOption[];

  @OneToMany(() => TradeSpot, (spot) => spot.trade)
  spots: TradeSpot[];

  @OneToMany(() => Transaction, (transaction) => transaction.trade)
  transactions: Transaction[];
}
