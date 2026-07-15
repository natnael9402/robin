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
import { SupportTicketMessage } from './support-ticket-message.entity';

export enum SupportTicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  AWAITING_USER = 'awaiting_user',
  CLOSED = 'closed',
}

export enum SupportTicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity({ name: 'support_tickets' })
export class SupportTicket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'enum', enum: SupportTicketStatus, default: SupportTicketStatus.OPEN })
  status: SupportTicketStatus;

  @Column({ type: 'enum', enum: SupportTicketPriority, default: SupportTicketPriority.MEDIUM })
  priority: SupportTicketPriority;

  @Column({ type: 'varchar', length: 255 })
  category: string;

  @Column({ type: 'timestamp', nullable: true, name: 'last_reply_at' })
  lastReplyAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'closed_at' })
  closedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToMany(() => SupportTicketMessage, (message) => message.ticket)
  messages: SupportTicketMessage[];
}