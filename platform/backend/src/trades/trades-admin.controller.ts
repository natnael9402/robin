import { Body, Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { TradesService } from './trades.service';

@Controller('admin/trades')
@UseGuards(AdminGuard)
export class AdminTradesController {
  constructor(private readonly trades: TradesService) {}

  @Post(':id/force/:outcome')
  force(@Param('id', ParseIntPipe) id: number, @Param('outcome') outcome: 'WIN' | 'LOSS') {
    return this.trades.forceOutcome(id, outcome);
  }
}
