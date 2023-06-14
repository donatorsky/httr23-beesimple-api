import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create_message.dto';

@Controller('chats/:chatId/messages')
export class MessageController {
  constructor(private readonly chatService: MessageService) {}

  @Get()
  async findAll(@Param('chatId') chatId: number): Promise<Message[]> {
    return this.chatService.findAll(chatId);
  }

  @Post()
  @HttpCode(201)
  async store(
    @Param('chatId') chatId: number,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatService
      .create({
        chat: {
          id: chatId,
        },
        role: createMessageDto.role,
        type: createMessageDto.type,
        contents: createMessageDto.contents,
      } as Message)
      .then((chat) => ({
        id: chat.id,
      }));
  }
}
