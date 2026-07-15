import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { Deposit, DepositStatus } from './deposit.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('deposits')
@UseGuards(JwtAuthGuard)
export class DepositsController {
  constructor(private readonly service: DepositsService) {}

  @Post()
  async create(@Req() req: any, @Body() data: Partial<Deposit>) {
    return this.service.create(req.user.userId, data);
  }

  @Get()
  async findMine(@Req() req: any) {
    return this.service.findByUser(req.user.userId);
  }

  @Get('pending')
  @UseGuards()
  async findPending() {
    return this.service.findAll(DepositStatus.PENDING);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: number) {
    return this.service.approve(id);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: number, @Body() body: { reason: string }) {
    return this.service.reject(id, body.reason);
  }
}