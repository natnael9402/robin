import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { DepositsService } from '../deposits/deposits.service';
import { WithdrawalsService } from '../withdrawals/withdrawals.service';
import { DepositDto, WithdrawDto } from './dto/transaction.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private readonly transactions: TransactionsService,
    private readonly deposits: DepositsService,
    private readonly withdrawals: WithdrawalsService,
  ) {}

  @Post('deposit')
  deposit(@Request() req: { user: { userId: number } }, @Body() body: DepositDto) {
    return this.deposits.create(req.user.userId, {
      amount: body.amount,
      paymentMethod: body.network,
      description: 'Deposit funds',
    });
  }

  @Post('withdraw')
  withdraw(@Request() req: { user: { userId: number } }, @Body() body: WithdrawDto) {
    return this.withdrawals.create(req.user.userId, {
      amount: body.amount,
      network: body.network,
      walletAddress: body.walletAddress,
      description: 'Withdraw funds',
    });
  }

  @Get()
  list(@Request() req: { user: { userId: number } }) {
    return this.transactions.findAllByUser(req.user.userId);
  }
}

@Controller('admin/transactions')
@UseGuards(AdminGuard)
export class AdminTransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get('pending')
  pending() {
    return this.transactions.findAllPending();
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.transactions.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.transactions.reject(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transactions.remove(id);
  }
}
