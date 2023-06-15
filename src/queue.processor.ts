import { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { OpenAIService } from './openai.service';
import { Chat, ChatStatusEnum } from './entities/chat.entity';
import {
  Message,
  MessageRoleEnum,
  MessageTypeEnum,
} from './entities/message.entity';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';

@Processor('queue')
export class QueueProcessor {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly openAIService: OpenAIService,
  ) {}

  @Process('openai')
  async processNamedJob(job: Job<any>): Promise<any> {
    return this.openAIService
      .chat(job.data.messages)
      .then((result) =>
        this.messageService.create({
          chat: {
            id: job.data.chat_id,
          },
          role: MessageRoleEnum.ASSISTANT,
          type: MessageTypeEnum.MESSAGE,
          contents: result.data.choices[0].message.content,
        } as Message),
      )
      .then(() =>
        this.chatService.create({
          id: job.data.chat_id,
          status: ChatStatusEnum.READY,
        } as Chat),
      )
      .catch((reason) => console.error(reason));
  }
}
