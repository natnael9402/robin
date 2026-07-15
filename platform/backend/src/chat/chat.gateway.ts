import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets = new Map<number, string>(); // userId -> socketId

    constructor(
        private chatService: ChatService,
        private jwtService: JwtService
    ) { }

    async handleConnection(client: Socket) {
        try {
            // Basic auth via query param or headers (simplified for MVP)
            const token = client.handshake.query.token as string; // or auth header
            if (!token) return; // Allow connection but IDK who it is? Or disconnect?

            const payload = this.jwtService.verify(token);
            client.data.userId = payload.sub;
            client.data.isAdmin = payload.isAdmin; // Assuming payload hasisAdmin

            this.userSockets.set(payload.sub, client.id);

            if (payload.isAdmin) {
                client.join('admin-room');
            } else {
                client.join(`user-${payload.sub}`);
            }

            console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
        } catch (e) {
            console.error('Socket Auth Failed', e.message);
            // client.disconnect(); // Optional: force disconnect
        }
    }

    handleDisconnect(client: Socket) {
        if (client.data.userId) {
            this.userSockets.delete(client.data.userId);
        }
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { message: string }
    ) {
        const userId = client.data.userId;
        if (!userId) return;

        // Save to DB
        const savedMsg = await this.chatService.saveMessage(userId, payload.message, 'user');

        // Emit to this user (ack)
        client.emit('newMessage', savedMsg);

        // Emit to Admins
        this.server.to('admin-room').emit('newMessage', savedMsg);
    }

    @SubscribeMessage('adminReply')
    async handleAdminReply(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { userId: number, message: string }
    ) {
        // Verify is admin
        //  if (!client.data.isAdmin) return; 

        // Save to DB
        const savedMsg = await this.chatService.saveMessage(payload.userId, payload.message, 'admin');

        // Emit to Admins (so seeing own sent message)
        this.server.to('admin-room').emit('newMessage', savedMsg);

        // Emit to Target User
        this.server.to(`user-${payload.userId}`).emit('newMessage', savedMsg);
    }
}
