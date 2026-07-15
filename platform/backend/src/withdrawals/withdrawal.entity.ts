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

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity({ name: 'withdrawals' })
export class Withdrawal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 255, default: 'USDT' })
  currency: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 15, scale: 8, default: 0, name: 'fee' })
  fee: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'transaction_id' })
  transactionId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'wallet_address' })
  walletAddress: string | null;

  @Column({ type: 'varchar', length: 20, default: 'TRC20', name: 'network' })
  network: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'bank_details' })
  bankDetails: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: WithdrawalStatus, default: WithdrawalStatus.PENDING })
  status: WithdrawalStatus;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason: string | null;

  @Column({ type: 'bigint', nullable: true, name: 'processed_by' })
  processedBy: number | null;

  @Column({ type: 'timestamp', nullable: true, name: 'processed_at' })
  processedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'processed_by', referencedColumnName: 'id' })
  processor: User;
}