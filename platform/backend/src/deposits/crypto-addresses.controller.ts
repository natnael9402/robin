import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { CryptoAddressesService } from './crypto-addresses.service';
import { CryptoAddress } from './crypto-address.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('crypto-addresses')
export class CryptoAddressesController {
  constructor(private readonly service: CryptoAddressesService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':currency/:network')
  async findOne(@Param('currency') currency: string, @Param('network') network: string) {
    return this.service.findByCurrencyAndNetwork(currency, network);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() data: Partial<CryptoAddress>) {
    return this.service.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(@Param('id') id: number, @Body() data: Partial<CryptoAddress>) {
    return this.service.update(id, data);
  }
}