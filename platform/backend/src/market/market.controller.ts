import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { MarketService, StockRow } from './market.service';

@Controller('market')
export class MarketController {
    constructor(private readonly marketService: MarketService) { }

    @Get('list')
    async getList() {
        const [crypto, stocks] = await Promise.all([
            this.marketService.getCrypto(),
            this.marketService.getStocks(),
        ]);
        return { crypto, stocks, metals: [] };
    }

    @Get('stocks')
    async getStocks(): Promise<StockRow[]> {
        return this.marketService.getStocks();
    }

    @Get('crypto')
    async getCrypto() {
        return this.marketService.getCrypto();
    }

    @Get('stocks/:symbol')
    async getStockDetail(@Param('symbol') symbol: string): Promise<StockRow> {
        return this.marketService.getStockDetail(symbol);
    }
    @Get('crypto/:id/history')
    async getCryptoHistory(@Param('id') id: string, @Query('days') days: number) {
        return this.marketService.getCryptoHistory(id, days || 7);
    }

    @Get('crypto/:id')
    async getCryptoDetail(@Param('id') id: string) {
        return this.marketService.getCryptoDetail(id);
    }

    @Get('stocks/:symbol/history')
    async getStockHistory(@Param('symbol') symbol: string, @Query('range') range: '1d' | '1w' | '1m' | '1y') {
        return this.marketService.getStockHistory(symbol, range || '1d');
    }

    @Get('logo/:symbol')
    async getLogo(@Param('symbol') symbol: string, @Res() res: Response) {
        const { buffer, mime } = await this.marketService.getLogo(symbol);
        res.set('Content-Type', mime);
        res.send(buffer);
    }
}
