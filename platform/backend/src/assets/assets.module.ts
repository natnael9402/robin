import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAsset } from './user-asset.entity';
import { User } from '../users/user.entity';
import { Transaction } from '../transactions/transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserAsset, User, Transaction]),
    ],
    controllers: [AssetsController],
    providers: [AssetsService],
    exports: [AssetsService],
})
export class AssetsModule { }
