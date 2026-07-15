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

export enum KycSubmissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity({ name: 'kyc_submissions' })
export class UserVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 255, name: 'document_type' })
  documentType: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'document_number' })
  documentNumber: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'front_image_url' })
  frontImageUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'back_image_url' })
  backImageUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'selfie_image_url' })
  selfieImageUrl: string | null;

  @Column({ type: 'enum', enum: KycSubmissionStatus, default: KycSubmissionStatus.PENDING })
  status: KycSubmissionStatus;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'approved_at' })
  approvedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'rejected_at' })
  rejectedAt: Date | null;

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
