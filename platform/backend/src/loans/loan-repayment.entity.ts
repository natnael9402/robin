import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Loan } from './loan.entity';
import { User } from '../users/user.entity';

export enum LoanRepaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity({ name: 'loan_repayments' })
export class LoanRepayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'loan_id' })
  loanId: number;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255, name: 'proof_image' })
  proofImage: string;

  @Column({ type: 'enum', enum: LoanRepaymentStatus, default: LoanRepaymentStatus.PENDING })
  status: LoanRepaymentStatus;

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

  @ManyToOne(() => Loan, (loan) => loan.repayments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loan_id', referencedColumnName: 'id' })
  loan: Loan;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'processed_by', referencedColumnName: 'id' })
  processor: User;
}