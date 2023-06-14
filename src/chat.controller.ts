import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create_chat.dto';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';

@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}

  @Get()
  async findAll(): Promise<Chat[]> {
    return this.chatService.findAll();
  }

  @Post()
  @HttpCode(201)
  async store(@Body() createChatDto: CreateChatDto) {
    const chat = await this.chatService
      .create({
        status: 'WAITING',
        title: createChatDto.title,
      } as Chat)
      .then((chat) =>
        this.messageService
          .create({
            chat: {
              id: chat.id,
            },
            role: 'system',
            type: 'system',
            contents:
              'You’re a kind assistant and translator. You have 2 tasks: first translate input to English and then summarize input text into 2-5 sentences using plain English language using simple words which can be understood by a person with B1 level English',
          } as Message)
          .then(() => chat),
      )
      .then((chat) =>
        this.messageService
          .create({
            chat: {
              id: chat.id,
            },
            role: 'user',
            type: 'message',
            contents: createChatDto.title,
          } as Message)
          .then(() => chat),
      );

    setTimeout(() => {
      this.messageService.create({
        chat: {
          id: chat.id,
        },
        role: 'test',
        type: 'test',
        contents: 'test',
      } as Message);

      this.chatService.update({
        id: chat.id,
        status: 'READY',
      } as Chat);
    }, 2500);

    return {
      id: chat.id,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<Chat> {
    return this.chatService.getById(id);
  }
}
