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

export enum DepositStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity({ name: 'deposits' })
export class Deposit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 255, default: 'USDT' })
  currency: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'transaction_id' })
  transactionId: string | null;

  @Column({ type: 'varchar', length: 255, name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'payment_details' })
  paymentDetails: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'proof_image' })
  proofImage: string | null;

  @Column({ type: 'enum', enum: DepositStatus, default: DepositStatus.PENDING })
  status: DepositStatus;

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