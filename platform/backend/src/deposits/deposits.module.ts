import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deposit } from './deposit.entity';
import { CryptoAddress } from './crypto-address.entity';
import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';
import { CryptoAddressesController } from './crypto-addresses.controller';
import { CryptoAddressesService } from './crypto-addresses.service';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Deposit, CryptoAddress, User])],
  controllers: [DepositsController, CryptoAddressesController],
  providers: [DepositsService, CryptoAddressesService],
  exports: [DepositsService, CryptoAddressesService],
})
export class DepositsModule {}