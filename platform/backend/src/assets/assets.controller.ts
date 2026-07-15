import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @UseGuards(JwtAuthGuard)
    @Get('portfolio')
    async getPortfolio(@Request() req: any) {
        return this.assetsService.getPortfolio(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('buy')
    async buyAsset(
        @Request() req: any,
        @Body() body: { symbol: string; type: 'crypto' | 'stock'; amount: number; price: number; name: string }
    ) {
        return this.assetsService.buyAsset(req.user.userId, body.symbol, body.type, body.amount, body.price, body.name);
    }

    @UseGuards(JwtAuthGuard)
    @Post('sell')
    async sellAsset(
        @Request() req: any,
        @Body() body: { symbol: string; amount: number; price: number; name?: string; type?: 'crypto' | 'stock' }
    ) {
        return this.assetsService.sellAsset(req.user.userId, body.symbol, body.amount, body.price, body.name, body.type);
    }
}
