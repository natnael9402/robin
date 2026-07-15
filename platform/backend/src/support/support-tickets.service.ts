import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './support-ticket.entity';
import { SupportTicketStatus } from './support-ticket.entity';

@Injectable()
export class SupportTicketsService {
  constructor(@InjectRepository(SupportTicket) private readonly repo: Repository<SupportTicket>) {}

  async create(userId: number, data: Partial<SupportTicket>) {
    const ticket = this.repo.create({ ...data, userId, status: SupportTicketStatus.OPEN });
    return this.repo.save(ticket);
  }

  async findByUser(userId: number) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' }, relations: ['messages'] });
  }

  async findAll(status?: SupportTicketStatus) {
    const where = status ? { status } : {};
    return this.repo.find({ where, relations: ['user', 'messages'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['user', 'messages'] });
  }

  async updateStatus(id: number, status: SupportTicketStatus) {
    const ticket = await this.repo.findOne({ where: { id } });
    if (!ticket) throw new Error('Ticket not found');
    ticket.status = status;
    if (status === SupportTicketStatus.CLOSED) ticket.closedAt = new Date();
    return this.repo.save(ticket);
  }
}