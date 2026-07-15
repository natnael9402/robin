import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { MiningService } from './mining.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/mining')
@UseGuards(JwtAuthGuard)
export class AdminMiningController {
    constructor(private readonly miningService: MiningService) { }

    @Get('users')
    async getAllMiners() {
        return this.miningService.getAllMiners();
    }

    @Post('halt/:id')
    async stopMiner(@Param('id') id: number) {
        return this.miningService.stopMiner(id);
    }
}
