import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { Loan } from '../loans/loan.entity';
import { ChatMessage } from '../chat/chat.entity';
import { UserAsset } from '../assets/user-asset.entity';
import { UserMining } from '../mining/user-mining.entity';
import { UserVerification } from '../verification/user-verification.entity';
import { CryptoAddress } from '../deposits/crypto-address.entity';
import { Deposit } from '../deposits/deposit.entity';
import { Withdrawal } from '../withdrawals/withdrawal.entity';
import { Notification } from '../notifications/notification.entity';
import { SupportTicket } from '../support/support-ticket.entity';
import { SupportTicketMessage } from '../support/support-ticket-message.entity';
import { PasswordResetToken } from '../auth/password-reset-token.entity';
import { Profile } from './profile.entity';
import { Trade } from '../trades/trade.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  phone: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'email_verified_at' })
  emailVerifiedAt: Date | null;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'remember_token' })
  rememberToken: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('decimal', { default: 0, scale: 2, precision: 15 })
  balance: number;

  @Column({ default: false, name: 'is_admin' })
  isAdmin: boolean;

  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  withdrawPassword: string | null;

  @Column({ type: 'varchar', default: 'ALWAYS_LOSS', name: 'trade_mode' })
  tradeMode: 'REAL' | 'ALWAYS_WIN' | 'ALWAYS_LOSS';

  @Column('decimal', { default: 0, scale: 2, precision: 10, name: 'trading_balance' })
  tradingBalance: number;

  @Column({ default: 0, name: 'mining_balance' })
  miningBalance: number;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.user)
  chatMessages: ChatMessage[];

  @OneToMany(() => Loan, (loan) => loan.user)
  loans: Loan[];

  @OneToMany(() => UserAsset, (asset) => asset.user)
  assets: UserAsset[];

  @OneToMany(() => UserMining, (mining) => mining.user)
  miningSubscriptions: UserMining[];

  @OneToMany(() => UserVerification, (verification) => verification.user)
  verification: UserVerification;

  @OneToMany(() => Trade, (trade) => trade.user)
  trades: Trade[];

  @OneToMany(() => CryptoAddress, (address) => address.creator)
  createdCryptoAddresses: CryptoAddress[];

  @OneToMany(() => CryptoAddress, (address) => address.updater)
  updatedCryptoAddresses: CryptoAddress[];

  @OneToMany(() => Deposit, (deposit) => deposit.user)
  deposits: Deposit[];

  @OneToMany(() => Withdrawal, (withdrawal) => withdrawal.user)
  withdrawals: Withdrawal[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => SupportTicket, (ticket) => ticket.user)
  supportTickets: SupportTicket[];

  @OneToMany(() => SupportTicketMessage, (message) => message.user)
  supportTicketMessages: SupportTicketMessage[];

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens: PasswordResetToken[];

  @OneToMany(() => Profile, (profile) => profile.user)
  profiles: Profile[];
}
