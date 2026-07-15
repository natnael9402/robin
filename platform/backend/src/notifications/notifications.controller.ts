import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  async findMine(@Req() req: any) {
    return this.service.findByUser(req.user.userId);
  }

  @Get('unread')
  async findUnread(@Req() req: any) {
    return this.service.findByUser(req.user.userId, true);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: number, @Req() req: any) {
    return this.service.markAsRead(id, req.user.userId);
  }

  @Post('read-all')
  async markAllAsRead(@Req() req: any) {
    return this.service.markAllAsRead(req.user.userId);
  }
}