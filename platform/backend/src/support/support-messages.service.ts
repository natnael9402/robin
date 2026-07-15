import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicketMessage } from './support-ticket-message.entity';

@Injectable()
export class SupportMessagesService {
  constructor(@InjectRepository(SupportTicketMessage) private readonly repo: Repository<SupportTicketMessage>) {}

  async create(ticketId: number, userId: number | null, adminId: number | null, message: string) {
    const msg = this.repo.create({ ticketId, userId, adminId, message });
    return this.repo.save(msg);
  }

  async findByTicket(ticketId: number) {
    return this.repo.find({ where: { ticketId }, order: { createdAt: 'ASC' } });
  }

  async markAsRead(id: number) {
    const msg = await this.repo.findOne({ where: { id } });
    if (!msg) throw new Error('Message not found');
    msg.isRead = true;
    return this.repo.save(msg);
  }
}