import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';

export enum ProfileKycStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum ProfileTradeStatus {
  WIN = 'win',
  LOSS = 'loss',
  NORMAL = 'normal',
}

@Entity({ name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, length: 36 })
  uuid: string;

  @Column({ default: 1 })
  level: number;

  @Column({ type: 'enum', enum: ProfileKycStatus, default: ProfileKycStatus.UNVERIFIED })
  kycStatus: ProfileKycStatus;

  @Column({ type: 'text', nullable: true })
  kycDocuments: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankAccount: string | null;

  @Column({ type: 'text', nullable: true })
  blockchainAddresses: string | null;

  @Column({ default: false })
  googleAuthEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  googleAuthSecret: string | null;

  @Column({ default: false })
  withdrawalPasswordEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  withdrawalPassword: string | null;

  @Column({ type: 'enum', enum: ProfileTradeStatus, nullable: true })
  tradeStatus: ProfileTradeStatus | null;

  @Column('decimal', { default: 0, scale: 8, precision: 20 })
  totalAssets: number;

  @Column({ type: 'varchar', length: 255, default: 'en' })
  preferredLanguage: string;

  @Column({ type: 'text', nullable: true })
  notificationSettings: string | null;

  @Column({ default: false })
  simTradeEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  inviteCode: string | null;

  @Column({ default: 0 })
  referralCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.profiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;
}