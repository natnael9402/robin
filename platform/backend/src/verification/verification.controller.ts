import { Controller, Post, Get, Body, Param, UseGuards, Request, Patch, ParseIntPipe } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('verification')
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) { }

    @UseGuards(JwtAuthGuard)
    @Post('submit')
    async submit(
        @Request() req: any,
        @Body() body: { fullName: string; documentType: string; documentNumber: string }
    ) {
        return this.verificationService.submit(req.user.userId, body.fullName, body.documentType, body.documentNumber);
    }

    @UseGuards(JwtAuthGuard)
    @Get('status')
    async getStatus(@Request() req: any) {
        return this.verificationService.getStatus(req.user.userId);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get('pending')
    async getPending() {
        return this.verificationService.getPending();
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Patch('approve/:id')
    async approve(@Param('id', ParseIntPipe) id: number) {
        return this.verificationService.approve(id);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Patch('reject/:id')
    async reject(@Param('id', ParseIntPipe) id: number) {
        return this.verificationService.reject(id);
    }
}
