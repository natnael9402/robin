import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class ChatMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', default: 'user' })
    sender: string; // 'user' | 'admin'

    @Column({ type: 'varchar', default: '' })
    message: string;

    @Column({ default: false })
    read: boolean;

    @ManyToOne(() => User, (user) => user.chatMessages)
    user: User;

    @Column({ nullable: true })
    userId: number; // Foreign key for explicit access

    @CreateDateColumn()
    createdAt: Date;
}
