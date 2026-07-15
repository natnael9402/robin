import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly repo: Repository<Notification>) {}

  async create(userId: number, data: Partial<Notification>) {
    const notification = this.repo.create({ ...data, userId });
    return this.repo.save(notification);
  }

  async findByUser(userId: number, unreadOnly = false) {
    const where = unreadOnly ? { userId, isRead: false } : { userId };
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.repo.findOne({ where: { id, userId } });
    if (!notification) throw new Error('Notification not found');
    notification.isRead = true;
    notification.readAt = new Date();
    return this.repo.save(notification);
  }

  async markAllAsRead(userId: number) {
    return this.repo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
  }
}