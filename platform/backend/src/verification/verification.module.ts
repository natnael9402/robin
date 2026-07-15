import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { UserVerification } from './user-verification.entity';
import { User } from '../users/user.entity';
import { Profile } from '../users/profile.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserVerification, User, Profile]),
    ],
    controllers: [VerificationController],
    providers: [VerificationService],
    exports: [VerificationService],
})
export class VerificationModule { }
