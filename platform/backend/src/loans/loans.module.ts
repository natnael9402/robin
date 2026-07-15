import { Module } from '@nestjs/common';
import { LoansController } from './loans.controller';
import { LoansAdminController } from './loans-admin.controller';
import { LoansService } from './loans.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './loan.entity';
import { LoanRepayment } from './loan-repayment.entity';
import { User } from '../users/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Loan, LoanRepayment, User]),
    ],
    controllers: [LoansController, LoansAdminController],
    providers: [LoansService],
    exports: [LoansService],
})
export class LoansModule { }
