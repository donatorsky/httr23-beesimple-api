import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat, ChatStatusEnum, ChatTypeEnum } from './entities/chat.entity';
import { CreateChatDto } from './dto/create_chat.dto';
import { MessageService } from './message.service';
import {
  Message,
  MessageRoleEnum,
  MessageTypeEnum,
} from './entities/message.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FileInterceptor } from '@nestjs/platform-express';
import * as pdfjslib from 'pdfjs-dist';
import { Response } from 'express';

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
  @HttpCode(HttpStatus.CREATED)
  async fromText(@Body() createChatDto: CreateChatDto) {
    const chat = await this.chatService.create({
      status: ChatStatusEnum.WAITING,
      type: ChatTypeEnum.TEXT,
      title: createChatDto.title.substring(0, 25),
    } as Chat);

    await this.storeMessagesAndQueueOpenAI(chat, createChatDto);

    return {
      id: chat.id,
    };
  }

  @Post('file')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async fromFile(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const doc = await pdfjslib.getDocument(file.buffer.buffer).promise;

    const pagesContents: string[] = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      await doc
        .getPage(pageNum)
        .then((page) => page.getTextContent())
        .then((tokens) =>
          tokens.items.map((token: any) => token.str.trim()).join(' '),
        )
        .then((text) => pagesContents.push(text));
    }

    const contents = pagesContents.join(' ').trim();

    if (contents === '') {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: 'File does not contain any text',
      });

      return;
    }

    const chat = await this.chatService.create({
      status: ChatStatusEnum.WAITING,
      type: ChatTypeEnum.PDF,
      title: file.originalname,
    } as Chat);

    await this.storeMessagesAndQueueOpenAI(chat, {
      title: contents,
    });

    return res.status(HttpStatus.CREATED).json({
      id: chat.id,
    });
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Chat> {
    return this.chatService.getById(id);
  }

  private async storeMessagesAndQueueOpenAI(
    chat: Chat,
    createChatDto: CreateChatDto,
  ) {
    const messages: Message[] = [];

    await this.messageService
      .create({
        chat: {
          id: chat.id,
        },
        role: MessageRoleEnum.SYSTEM,
        type: MessageTypeEnum.SYSTEM,
        contents:
          'You’re a kind assistant and translator. You have 2 tasks: first translate input to English and then summarize input text into 2-5 sentences using plain English language using simple words which can be understood by a person with B1 level English',
      } as Message)
      .then((message) =>
        messages.push({
          role: message.role,
          contents: message.contents,
        } as Message),
      );

    await this.messageService
      .create({
        chat: {
          id: chat.id,
        },
        role: MessageRoleEnum.USER,
        type:
          chat.type == ChatTypeEnum.TEXT
            ? MessageTypeEnum.MESSAGE
            : MessageTypeEnum.FILE,
        contents: createChatDto.title,
      } as Message)
      .then((message) =>
        messages.push({
          role: message.role,
          contents: message.contents,
        } as Message),
      );

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
  }
}
