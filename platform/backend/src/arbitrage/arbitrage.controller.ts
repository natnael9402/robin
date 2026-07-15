import { Controller, Get, Post, Body, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ArbitrageService } from './arbitrage.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('arbitrage')
@UseGuards(JwtAuthGuard)
export class ArbitrageController {
  constructor(private readonly service: ArbitrageService) {}

  @Get('plans')
  getPlans() {
    return this.service.getPlans();
  }

  @Post('host')
  host(@Request() req: any, @Body() body: { planCode: number; amount: number; currency?: string }) {
    return this.service.startHosting(req.user.userId, body.planCode, body.amount, body.currency);
  }

  @Get('my')
  my(@Request() req: any) {
    return this.service.findMyHostings(req.user.userId);
  }

  @Get('hostings')
  @UseGuards(AdminGuard)
  hostings() {
    return this.service.findAllHostings();
  }

  @Patch('hostings/:id/terminate')
  @UseGuards(AdminGuard)
  terminate(@Param('id') id: string) {
    return this.service.terminateHosting(+id);
  }
}
