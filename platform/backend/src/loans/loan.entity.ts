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
import { LoanRepayment } from './loan-repayment.entity';

export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REPAID = 'repaid',
  OVERDUE = 'overdue',
}

@Entity({ name: 'loans' })
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255, default: 'USDT', name: 'currency' })
  currency: string;

  @Column({ type: 'enum', enum: LoanStatus, default: LoanStatus.PENDING })
  status: LoanStatus;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'document_type' })
  documentType: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'front_image' })
  frontImage: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'back_image' })
  backImage: string | null;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason: string | null;

  @Column({ default: 30, name: 'duration' })
  duration: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0, name: 'interest_rate' })
  interestRate: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0, name: 'total_payable' })
  totalPayable: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0, name: 'accumulated_interest' })
  accumulatedInterest: number;

  @Column({ type: 'timestamp', nullable: true, name: 'last_interest_date' })
  lastInterestDate: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'due_date' })
  dueDate: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'approved_at' })
  approvedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'repaid_at' })
  repaidAt: Date | null;

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

  @OneToMany(() => LoanRepayment, (repayment) => repayment.loan)
  repayments: LoanRepayment[];
}
