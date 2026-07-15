import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MiningService } from './mining.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('mining')
export class MiningController {
    constructor(private readonly miningService: MiningService) { }

    @Get('plans')
    async getPlans() {
        return this.miningService.getPlans();
    }

    @UseGuards(JwtAuthGuard)
    @Post('subscribe')
    async subscribe(@Request() req: any, @Body() body: { planId: number; amount?: number }) {
        return this.miningService.subscribe(req.user.id, body.planId, body.amount || 0);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my')
    async getMyMining(@Request() req: any) {
        return this.miningService.getMyMining(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('active')
    async getActive(@Request() req: any) {
        return this.miningService.getActiveMinersForUser(req.user.id);
    }
}
