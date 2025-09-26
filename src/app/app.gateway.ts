import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Prisma } from '@prisma/client';

import { Server, Socket } from 'socket.io';
import { AppService } from 'src/app.service';

@WebSocketGateway()
export class AppGateway  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  constructor (
    private appService: AppService, 
    private users: Record<string, string> = {}

  ){}
  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: Prisma.ChatCreateInput): Promise<void> {
    await this.appService.createMessage(payload)
    this.server.emit('recMessage', payload)
  }

@SubscribeMessage('join')
handleJoin(@MessageBody() username: string, @ConnectedSocket() client: Socket) {
  this.users[client.id] = username;

  
  this.server.emit('systemMessage', `${username} подключился`);

  
  this.server.emit('usersList', Object.values(this.users));
}




  afterInit(server: any) {
    console.log(server)
  }
  handleConnection (client: Socket) { 
    console.log(`Connected: ${client.id}`);
  }

 handleDisconnect(client: Socket) {
  const username = this.users[client.id];
  if (username) {
    delete this.users[client.id];

    this.server.emit('systemMessage', `${username} отключился`);
    this.server.emit('usersList', Object.values(this.users));
  }
}

