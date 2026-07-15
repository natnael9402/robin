import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { Withdrawal, WithdrawalStatus } from './withdrawal.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
export class WithdrawalsController {
  constructor(private readonly service: WithdrawalsService) {}

  @Post()
  async create(@Req() req: any, @Body() data: Partial<Withdrawal>) {
    return this.service.create(req.user.userId, data);
  }

  @Get()
  async findMine(@Req() req: any) {
    return this.service.findByUser(req.user.userId);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findPending() {
    return this.service.findAll(WithdrawalStatus.PENDING);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async approve(@Param('id') id: number) {
    return this.service.approve(id);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async reject(@Param('id') id: number, @Body() body: { reason: string }) {
    return this.service.reject(id, body.reason);
  }

  @Get('fee-preview')
  async previewFee(@Body() body: { currency: string; amount: number; network: string }) {
    return { fee: WithdrawalsService.calculateFee(body.currency, body.amount, body.network) };
  }
}