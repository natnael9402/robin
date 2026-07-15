import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { LoansService } from './loans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
    constructor(private readonly loansService: LoansService) {}

    @Post('apply')
    async apply(
        @Request() req: any,
        @Body('amount') amount: number,
        @Body('duration') duration: number,
    ) {
        return this.loansService.apply(req.user.userId, amount, duration);
    }

    @Get('my')
    async getMyLoans(@Request() req: any) {
        return this.loansService.getMyLoans(req.user.userId);
    }

    @Post(':loanId/repayments')
    async submitRepayment(
        @Request() req: any,
        @Param('loanId') loanId: number,
        @Body('amount') amount: number,
        @Body('proofImage') proofImage: string,
    ) {
        return this.loansService.submitRepayment(req.user.userId, loanId, amount, proofImage);
    }
}
