import { Module } from '@nestjs/common';
import { MiningController } from './mining.controller';
import { MiningService } from './mining.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiningPlan } from './mining-plan.entity';
import { UserMining } from './user-mining.entity';
import { User } from '../users/user.entity';
import { AdminMiningController } from './admin-mining.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([MiningPlan, UserMining, User]),
    ],
    controllers: [MiningController, AdminMiningController],
    providers: [MiningService],
    exports: [MiningService],
})
export class MiningModule { }
