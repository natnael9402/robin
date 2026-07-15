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

@Entity({ name: 'crypto_addresses' })
export class CryptoAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  currency: string;

  @Column({ length: 20 })
  network: string;

  @Column({ length: 255 })
  address: string;

  @Column({ type: 'text', nullable: true })
  qrCode: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'bigint', nullable: true, name: 'created_by' })
  createdBy: number | null;

  @Column({ type: 'bigint', nullable: true, name: 'updated_by' })
  updatedBy: number | null;

  @Column({ type: 'timestamp', nullable: true, name: 'last_updated' })
  lastUpdated: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  creator: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updater: User;
}