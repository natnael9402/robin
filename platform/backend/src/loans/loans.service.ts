import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan, LoanStatus } from './loan.entity';
import { LoanRepayment, LoanRepaymentStatus } from './loan-repayment.entity';
import { User } from '../users/user.entity';

@Injectable()
export class LoansService {
    constructor(
        @InjectRepository(Loan)
        private loanRepo: Repository<Loan>,
        @InjectRepository(LoanRepayment)
        private repaymentRepo: Repository<LoanRepayment>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

    async apply(userId: number, amount: number, durationDays: number) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');
        if (!user.isVerified) throw new BadRequestException('Identity verification required');

        const pendingLoans = await this.loanRepo.count({
            where: { user: { id: userId }, status: LoanStatus.PENDING },
        });
        if (pendingLoans > 0) throw new BadRequestException('You have a pending loan application');

        const interestRate = 5;
        const totalPayable = amount + (amount * interestRate / 100);

        const loan = this.loanRepo.create({
            user,
            amount,
            interestRate,
            totalPayable,
            duration: durationDays,
            dueDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
            status: LoanStatus.PENDING,
        });

        return this.loanRepo.save(loan);
    }

    async approve(id: number) {
        const loan = await this.loanRepo.findOne({ where: { id }, relations: ['user'] });
        if (!loan) throw new BadRequestException('Loan not found');
        if (loan.status !== LoanStatus.PENDING) throw new BadRequestException('Loan not pending');

        loan.status = LoanStatus.APPROVED;
        loan.approvedAt = new Date();
        loan.user.balance = Number(loan.user.balance) + Number(loan.amount);

        await this.userRepo.save(loan.user);
        return this.loanRepo.save(loan);
    }

    async reject(id: number, reason?: string) {
        const loan = await this.loanRepo.findOne({ where: { id } });
        if (!loan) throw new BadRequestException('Loan not found');
        if (loan.status !== LoanStatus.PENDING) throw new BadRequestException('Loan not pending');
        loan.status = LoanStatus.REJECTED;
        if (reason) loan.rejectionReason = reason;
        return this.loanRepo.save(loan);
    }

    async getMyLoans(userId: number) {
        return this.loanRepo.find({
            where: { user: { id: userId } },
            relations: ['repayments'],
            order: { createdAt: 'DESC' },
        });
    }

    async getPendingLoans() {
        return this.loanRepo.find({
            where: { status: LoanStatus.PENDING },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async getAllLoans() {
        return this.loanRepo.find({
            relations: ['user', 'repayments'],
            order: { createdAt: 'DESC' },
        });
    }

    // ── Repayments ────────────────────────────────────────────────────────────

    async submitRepayment(userId: number, loanId: number, amount: number, proofImage: string) {
        const loan = await this.loanRepo.findOne({ where: { id: loanId, user: { id: userId } } });
        if (!loan) throw new NotFoundException('Loan not found');
        if (loan.status !== LoanStatus.APPROVED) throw new BadRequestException('Loan is not active');

        const repayment = this.repaymentRepo.create({
            loanId,
            amount,
            proofImage,
            status: LoanRepaymentStatus.PENDING,
        });

        return this.repaymentRepo.save(repayment);
    }

    async approveRepayment(id: number) {
        const repayment = await this.repaymentRepo.findOne({ where: { id }, relations: ['loan', 'loan.user'] });
        if (!repayment) throw new NotFoundException('Repayment not found');
        if (repayment.status !== LoanRepaymentStatus.PENDING) throw new BadRequestException('Not pending');

        repayment.status = LoanRepaymentStatus.APPROVED;
        repayment.processedAt = new Date();
        await this.repaymentRepo.save(repayment);

        // Deduct repaid amount from user balance
        const user = repayment.loan.user;
        user.balance = Number(user.balance) - Number(repayment.amount);
        await this.userRepo.save(user);

        // Check if fully repaid
        const approved = await this.repaymentRepo.find({
            where: { loanId: repayment.loanId, status: LoanRepaymentStatus.APPROVED },
        });
        const totalRepaid = approved.reduce((sum, r) => sum + Number(r.amount), 0);

        if (totalRepaid >= Number(repayment.loan.totalPayable)) {
            repayment.loan.status = LoanStatus.REPAID;
            repayment.loan.repaidAt = new Date();
            await this.loanRepo.save(repayment.loan);
        }

        return repayment;
    }

    async rejectRepayment(id: number, reason?: string) {
        const repayment = await this.repaymentRepo.findOne({ where: { id } });
        if (!repayment) throw new NotFoundException('Repayment not found');
        if (repayment.status !== LoanRepaymentStatus.PENDING) throw new BadRequestException('Not pending');

        repayment.status = LoanRepaymentStatus.REJECTED;
        repayment.processedAt = new Date();
        if (reason) repayment.rejectionReason = reason;

        return this.repaymentRepo.save(repayment);
    }

    async getPendingRepayments() {
        return this.repaymentRepo.find({
            where: { status: LoanRepaymentStatus.PENDING },
            relations: ['loan', 'loan.user'],
            order: { createdAt: 'DESC' },
        });
    }
}
