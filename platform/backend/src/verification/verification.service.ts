import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserVerification, KycSubmissionStatus } from './user-verification.entity';
import { User } from '../users/user.entity';
import { Profile, ProfileKycStatus } from '../users/profile.entity';

@Injectable()
export class VerificationService {
    constructor(
        @InjectRepository(UserVerification)
        private verificationRepo: Repository<UserVerification>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Profile)
        private profileRepo: Repository<Profile>,
    ) { }

    async submit(userId: number, fullName: string, documentType: string, documentNumber: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');
        if (user.isVerified) throw new BadRequestException('Already verified');

        const existing = await this.verificationRepo.findOne({ where: { user: { id: userId } } });
        if (existing && existing.status === KycSubmissionStatus.PENDING) throw new BadRequestException('Verification pending');

        const verification = this.verificationRepo.create({
            user,
            documentType,
            documentNumber,
            status: KycSubmissionStatus.PENDING
        });

        return this.verificationRepo.save(verification);
    }

    async getStatus(userId: number) {
        return this.verificationRepo.findOne({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
    }

    async getPending() {
        return this.verificationRepo.find({ where: { status: KycSubmissionStatus.PENDING }, relations: ['user'] });
    }

    async approve(id: number) {
        const verification = await this.verificationRepo.findOne({ where: { id }, relations: ['user'] });
        if (!verification) throw new BadRequestException('Verification not found');

        verification.status = KycSubmissionStatus.APPROVED;
        await this.verificationRepo.save(verification);

        verification.user.isVerified = true;
        await this.userRepo.save(verification.user);

        // Also sync Profile.kycStatus so withdrawals pass the KYC check
        const profile = await this.profileRepo.findOne({ where: { userId: verification.userId } });
        if (profile) {
            profile.kycStatus = ProfileKycStatus.VERIFIED;
            await this.profileRepo.save(profile);
        }

        return verification;
    }

    async reject(id: number) {
        const verification = await this.verificationRepo.findOne({ where: { id } });
        if (!verification) throw new BadRequestException('Verification not found');

        verification.status = KycSubmissionStatus.REJECTED;
        await this.verificationRepo.save(verification);

        // Sync Profile.kycStatus
        const profile = await this.profileRepo.findOne({ where: { userId: verification.userId } });
        if (profile) {
            profile.kycStatus = ProfileKycStatus.REJECTED;
            await this.profileRepo.save(profile);
        }

        return verification;
    }
}
