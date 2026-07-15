import { Controller, Get, Post, Body, Param, UseGuards, Req, Put } from '@nestjs/common';
import { SupportMessagesService } from './support-messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('support-messages')
@UseGuards(JwtAuthGuard)
export class SupportMessagesController {
  constructor(private readonly service: SupportMessagesService) {}

  @Get('ticket/:ticketId')
  async findByTicket(@Param('ticketId') ticketId: number) {
    return this.service.findByTicket(ticketId);
  }

  @Post('ticket/:ticketId')
  async create(@Param('ticketId') ticketId: number, @Req() req: any, @Body() body: { message: string }) {
    return this.service.create(ticketId, req.user.userId, null, body.message);
  }

  @Post('ticket/:ticketId/admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createAdmin(@Param('ticketId') ticketId: number, @Req() req: any, @Body() body: { message: string }) {
    return this.service.create(ticketId, null, req.user.userId, body.message);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: number) {
    return this.service.markAsRead(id);
  }
}