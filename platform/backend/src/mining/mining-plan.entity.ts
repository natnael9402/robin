import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserMining } from './user-mining.entity';

export enum MiningHostingStatus {
  RUNNING = 'running',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'mining_products' })
export class MiningPlan {
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

  @Column({ name: 'limit_times' })
  limitTimes: number;

  @Column({ type: 'varchar', length: 255, name: 'hashrate' })
  hashrate: string;

  @Column({ type: 'varchar', length: 255, name: 'power' })
  power: string;

  @Column({ type: 'varchar', length: 255, name: 'network_type' })
  networkType: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'manufacturer' })
  manufacturer: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  size: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  weight: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  temperature: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  humidity: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string | null;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserMining, (mining) => mining.plan)
  hostings: UserMining[];
}
