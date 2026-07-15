import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('history')
    getMyHistory(@Request() req: any) {
        return this.chatService.getUserHistory(req.user.userId);
    }

    @Get('admin/conversations')
    @UseGuards(AdminGuard)
    getAllConversations() {
        return this.chatService.getConversations();
    }

    @Get('admin/history/:userId')
    @UseGuards(AdminGuard)
    getUserHistoryForAdmin(@Param('userId') userId: string) {
        const uid = parseInt(userId, 10);
        if (isNaN(uid)) return [];
        return this.chatService.getUserHistory(uid);
    }
}
