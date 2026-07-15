import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ArbitrageHosting } from './arbitrage-hosting.entity';

export enum ArbitrageHostingStatus {
  RUNNING = 'running',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'arbitrage_products' })
export class ArbitrageProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  days: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'daily_rate' })
  dailyRate: number;

  @Column('decimal', { precision: 14, scale: 2, name: 'min_amount' })
  minAmount: number;

  @Column('decimal', { precision: 14, scale: 2, name: 'max_amount' })
  maxAmount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string | null;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'text', nullable: true, name: 'supported_currencies' })
  supportedCurrencies: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ArbitrageHosting, (hosting) => hosting.product)
  hostings: ArbitrageHosting[];
}