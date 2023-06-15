import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { Message, MessageRoleEnum } from './entities/message.entity';
import { ChatCompletionRequestMessageRoleEnum } from 'openai/api';

@Injectable()
export class OpenAIService {
  private openai: OpenAIApi;

  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) {
    this.openai = new OpenAIApi(
      new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      }),
    );
  }

  async chat(messages: Message[]) {
    return this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages
        .filter((message) => {
          switch (message.role) {
            case MessageRoleEnum.SYSTEM:
              return true;

            case MessageRoleEnum.USER:
              return true;

            case MessageRoleEnum.ASSISTANT:
              return true;

            default:
              return false;
          }
        })
        .map((message): ChatCompletionRequestMessage => {
          return {
            role: message.role as ChatCompletionRequestMessageRoleEnum,
            content: message.contents,
          };
        }),
    });
  }
}
