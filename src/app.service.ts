import { Injectable } from '@nestjs/common';
import { Chat, Prisma, } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';


@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(data: Prisma.ChatCreateInput): Promise<Chat> {
    return await this.prisma.chat.create({ data });
  }

  async getMessages(): Promise<Chat[]>{
    return await this.prisma.chat.findMany();
  }

  async updateMessage(id: number, text: string) {
  return this.prisma.chat.update({
    where: { id },
    data: { text },
  });
}

async deleteMessage(id: number) {
  return this.prisma.chat.delete({
    where: { id },
  });
}
}
