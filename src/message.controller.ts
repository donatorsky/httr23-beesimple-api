import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { MessageService } from './message.service';
import {
  Message,
  MessageRoleEnum,
  MessageTypeEnum,
} from './entities/message.entity';
import { CreateMessageDto } from './dto/create_message.dto';
import { ChatService } from './chat.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Chat, ChatStatusEnum } from './entities/chat.entity';

@Controller('chats/:chatId/messages')
export class MessageController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    @InjectQueue('queue') private queue: Queue,
  ) {}

  @Get()
  async findAll(
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<Message[]> {
    return this.messageService.findAll(chatId, true);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async store(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const chat = await this.chatService.getById(chatId);

    const newMessage = await this.messageService.create({
      chat: {
        id: chat.id,
      },
      role: MessageRoleEnum.USER,
      type: MessageTypeEnum.MESSAGE,
      contents: createMessageDto.contents,
    } as Message);

    await this.chatService.create({
      id: chat.id,
      status: ChatStatusEnum.WAITING,
    } as Chat);

    await this.queue.add(
      'openai',
      {
        chat_id: chat.id,
        messages: (
          await this.messageService.findAll(chat.id, false, 'ASC')
        ).map((message, idx) => {
          if (idx > 1 && message.role === MessageRoleEnum.USER) {
            return {
              role: message.role,
              contents: `Please answer the question in very simple ${chat.language}, suitable for someone who only knows basic ${chat.language} (A2 level proficiency). Question: ${message.contents}.`,
            };
          }

          return {
            role: message.role,
            contents: message.contents,
          };
        }),
      },
      {
        removeOnComplete: true,
      },
    );

    return {
      id: newMessage.id,
    };
  }
}
