import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './chat.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatMessage)
        private chatRepository: Repository<ChatMessage>,
    ) { }

    async saveMessage(userId: number, text: string, sender: 'user' | 'admin') {
        const msg = this.chatRepository.create({
            userId,
            message: text,
            sender,
            read: sender === 'admin', // Admin msgs read by definition (or handled by client)
        });
        return this.chatRepository.save(msg);
    }

    async getUserHistory(userId: number) {
        return this.chatRepository.find({
            where: { userId },
            order: { createdAt: 'ASC' },
            take: 100, // Limit history
        });
    }

    async getConversations() {
        // Get unique users who have chatted, with latest message
        // This is a bit complex in pure TypeORM, so we'll use a raw query or just fetch distinct userIDs
        // Ideally: distinct userId + user details + unread count

        // Simplified: Find all messages, group by userId (in application logic for MVP or simple robust query)
        const latestMessages = await this.chatRepository
            .createQueryBuilder('chat')
            .leftJoinAndSelect('chat.user', 'user')
            .select(['chat.userId', 'user.email', 'user.name', 'MAX(chat.createdAt) as lastMessage'])
            .groupBy('chat.userId')
            .addGroupBy('user.id') // Ensure valid group by
            .orderBy('lastMessage', 'DESC')
            .getRawMany();

        // The raw query above gives structure. Let's do a more robust way:
        // Fetch unique userIds from chat table first.
        const userIds = await this.chatRepository
            .createQueryBuilder('chat')
            .select('DISTINCT chat.userId', 'userId')
            .where('chat.userId IS NOT NULL')
            .getRawMany();

        const ids = userIds.map(u => u.userId);
        if (!ids.length) return [];

        // Now fetch details for each active conversation
        // We want the user info + last message
        // This is inefficient loop but safe for small MVP. 
        // Optimization: Single complex query later.

        const conversations = [];
        for (const id of ids) {
            const lastMsg = await this.chatRepository.findOne({
                where: { userId: id },
                order: { createdAt: 'DESC' },
                relations: ['user']
            });
            if (lastMsg) {
                conversations.push({
                    userId: id,
                    user: lastMsg.user,
                    lastMessage: lastMsg.message,
                    lastMessageAt: lastMsg.createdAt
                });
            }
        }

        // Sort by latest
        return conversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
    }
}
