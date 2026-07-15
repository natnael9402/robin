import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './chat.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ChatMessage]),
        AuthModule,
    ],
    providers: [ChatService, ChatGateway],
    controllers: [ChatController],
    exports: [ChatService],
})
export class ChatModule { }
