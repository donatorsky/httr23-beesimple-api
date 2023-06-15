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
    const newMessage = await this.messageService.create({
      chat: {
        id: chatId,
      },
      role: MessageRoleEnum.USER,
      type: MessageTypeEnum.MESSAGE,
      contents: createMessageDto.contents,
    } as Message);

    await this.chatService.create({
      id: chatId,
      status: ChatStatusEnum.WAITING,
    } as Chat);

    await this.queue.add(
      'openai',
      {
        chat_id: chatId,
        messages: (
          await this.messageService.findAll(chatId, false, 'ASC')
        ).map(
          (message) =>
            ({
              role: message.role,
              contents: message.contents,
            } as Message),
        ),
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
