import { Controller, Get, Post, Body, Param, UseGuards, Req, Put } from '@nestjs/common';
import { SupportTicketsService } from './support-tickets.service';
import { SupportTicket, SupportTicketStatus } from './support-ticket.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('support-tickets')
@UseGuards(JwtAuthGuard)
export class SupportTicketsController {
  constructor(private readonly service: SupportTicketsService) {}

  @Post()
  async create(@Req() req: any, @Body() data: Partial<SupportTicket>) {
    return this.service.create(req.user.userId, data);
  }

  @Get()
  async findMine(@Req() req: any) {
    return this.service.findByUser(req.user.userId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateStatus(@Param('id') id: number, @Body() body: { status: SupportTicketStatus }) {
    return this.service.updateStatus(id, body.status);
  }
}