import { Controller, Get, Post, Body, UseGuards, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './user.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { AddBalanceDto } from './dto/add-balance.dto';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/balance')
  async setBalance(@Param('id', ParseIntPipe) id: number, @Body() body: { amount: number }) {
    await this.usersService.setBalance(id, body.amount);
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/trade-role')
  async setTradeMode(@Param('id', ParseIntPipe) id: number, @Body() body: { mode: 'REAL' | 'ALWAYS_WIN' | 'ALWAYS_LOSS' }) {
    return this.usersService.setTradeMode(id, body.mode);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(+id);
    return user;
  }
}
