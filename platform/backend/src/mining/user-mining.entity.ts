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
import { MiningPlan } from './mining-plan.entity';
import { MiningHostingStatus } from './mining-plan.entity';

@Entity({ name: 'mining_hostings' })
export class UserMining {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'bigint', name: 'product_id' })
  productId: number;

  @Column('decimal', { precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: MiningHostingStatus, default: MiningHostingStatus.RUNNING })
  status: MiningHostingStatus;

  @Column({ length: 255, default: 'USDT' })
  currency: string;

  @CreateDateColumn({ name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'end_date' })
  endDate: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'last_profit_date' })
  lastProfitDate: Date | null;

  @Column('decimal', { precision: 14, scale: 2, default: 0, name: 'total_earned' })
  totalEarned: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => MiningPlan, (plan) => plan.hostings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  plan: MiningPlan;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
