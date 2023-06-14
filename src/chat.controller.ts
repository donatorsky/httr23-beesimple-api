import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat, StatusEnum } from './entities/chat.entity';
import { CreateChatDto } from './dto/create_chat.dto';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    @InjectQueue('queue') private queue: Queue,
  ) {}

  @Get()
  async findAll(): Promise<Chat[]> {
    return this.chatService.findAll();
  }

  @Post()
  @HttpCode(201)
  async store(@Body() createChatDto: CreateChatDto) {
    const chat = await this.chatService.create({
      status: StatusEnum.WAITING,
      title: createChatDto.title.substring(0, 25),
    } as Chat);

    const messages: Message[] = [];

    await this.messageService
      .create({
        chat: {
          id: chat.id,
        },
        role: 'system',
        type: 'system',
        contents:
          'You’re a kind assistant and translator. You have 2 tasks: first translate input to English and then summarize input text into 2-5 sentences using plain English language using simple words which can be understood by a person with B1 level English',
      } as Message)
      .then((message) => messages.push(message));

    await this.messageService
      .create({
        chat: {
          id: chat.id,
        },
        role: 'user',
        type: 'message',
        contents: createChatDto.title,
      } as Message)
      .then((message) => messages.push(message));

    await this.queue.add(
      'openai',
      {
        chat_id: chat.id,
        messages: messages,
      },
      {
        removeOnComplete: true,
      },
    );

    return {
      id: chat.id,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<Chat> {
    return this.chatService.getById(id);
  }
}
