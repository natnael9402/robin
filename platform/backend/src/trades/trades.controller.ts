import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TradesService } from './trades.service';
import { StartTradeDto, TransferDto } from './dto/trade.dto';

@Controller('trades')
@UseGuards(JwtAuthGuard)
export class TradesController {
  constructor(private readonly trades: TradesService) {}

  @Post('start')
  start(@Request() req: { user: { userId: number } }, @Body() dto: StartTradeDto) {
    return this.trades.startOptionTrade(req.user.userId, { symbol: dto.asset, direction: 'buy', amount: dto.amount, duration: dto.duration });
  }

  @Post('resolve/:id')
  resolve(@Request() req: { user: { userId: number } }, @Param('id', ParseIntPipe) id: number) {
    return this.trades.resolveOptionTrade(req.user.userId, id);
  }

  @Post('transfer')
  transfer(@Request() req: { user: { userId: number } }, @Body() dto: TransferDto) {
    return this.trades.transferToTrading(req.user.userId, dto.amount);
  }

  @Get('balance')
  balance(@Request() req: { user: { userId: number } }) {
    return this.trades.getTradingBalance(req.user.userId);
  }

  @Get('active')
  active(@Request() req: { user: { userId: number } }) {
    return this.trades.getActiveTrades(req.user.userId);
  }
}
