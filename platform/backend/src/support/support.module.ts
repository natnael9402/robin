import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicket } from './support-ticket.entity';
import { SupportTicketMessage } from './support-ticket-message.entity';
import { SupportTicketsController } from './support-tickets.controller';
import { SupportTicketsService } from './support-tickets.service';
import { SupportMessagesController } from './support-messages.controller';
import { SupportMessagesService } from './support-messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupportTicket, SupportTicketMessage])],
  controllers: [SupportTicketsController, SupportMessagesController],
  providers: [SupportTicketsService, SupportMessagesService],
  exports: [SupportTicketsService, SupportMessagesService],
})
export class SupportModule {}