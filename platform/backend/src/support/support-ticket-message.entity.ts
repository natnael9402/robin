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
import { SupportTicket } from './support-ticket.entity';

@Entity({ name: 'support_ticket_messages' })
export class SupportTicketMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'ticket_id' })
  ticketId: number;

  @Column({ type: 'bigint', nullable: true, name: 'user_id' })
  userId: number | null;

  @Column({ type: 'bigint', nullable: true, name: 'admin_id' })
  adminId: number | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ type: 'text', nullable: true })
  attachments: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id', referencedColumnName: 'id' })
  admin: User;

  @ManyToOne(() => SupportTicket, (ticket) => ticket.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id', referencedColumnName: 'id' })
  ticket: SupportTicket;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}