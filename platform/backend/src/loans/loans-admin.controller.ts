import { Controller, Post, Patch, Param, Get, Body, UseGuards } from '@nestjs/common';
import { LoansService } from './loans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/loans')
@UseGuards(JwtAuthGuard, AdminGuard)
export class LoansAdminController {
    constructor(private readonly loansService: LoansService) {}

    @Get()
    async getAll() {
        return this.loansService.getAllLoans();
    }

    @Get('pending')
    async getPending() {
        return this.loansService.getPendingLoans();
    }

    @Patch(':id/approve')
    async approve(@Param('id') id: number) {
        return this.loansService.approve(id);
    }

    @Patch(':id/reject')
    async reject(@Param('id') id: number, @Body('reason') reason?: string) {
        return this.loansService.reject(id, reason);
    }

    @Get('repayments/pending')
    async getPendingRepayments() {
        return this.loansService.getPendingRepayments();
    }

    @Patch('repayments/:id/approve')
    async approveRepayment(@Param('id') id: number) {
        return this.loansService.approveRepayment(id);
    }

    @Patch('repayments/:id/reject')
    async rejectRepayment(@Param('id') id: number, @Body('reason') reason?: string) {
        return this.loansService.rejectRepayment(id, reason);
    }
}
