import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Prisma } from '@prisma/client';

import { Server, Socket } from 'socket.io';
import { AppService } from 'src/app.service';

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private users: Record<string, string> = {};
  constructor(private appService: AppService) {}
  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: Prisma.ChatCreateInput,
  ): Promise<void> {
    const saved = await this.appService.createMessage(payload); 
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() username: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.users[client.id] = username;

    this.server.emit('systemMessage', `${username} connected`);

    this.server.emit('usersList', Object.values(this.users));
  }

  afterInit(server: any) {
    console.log(server);
  }
  handleConnection(client: Socket) {
    console.log(`Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const username = this.users[client.id];
    if (username) {
      delete this.users[client.id];

      this.server.emit('systemMessage', `${username} disconected`);
      this.server.emit('usersList', Object.values(this.users));
    }
  }
@SubscribeMessage('editMessage')
async handleEditMessage(
  @MessageBody() payload: { id: number; text: string },
  @ConnectedSocket() client: Socket,
): Promise<void> {
  const updated = await this.appService.updateMessage(payload.id, payload.text);
  this.server.emit('messageEdited', updated);
}

@SubscribeMessage('deleteMessage')
async handleDeleteMessage(
  @MessageBody() id: number,
  @ConnectedSocket() client: Socket,
): Promise<void> {
  await this.appService.deleteMessage(id);
  this.server.emit('messageDeleted', id);
}

}
