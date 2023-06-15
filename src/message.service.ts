import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrderValue, Not, Repository } from 'typeorm';
import { Message, MessageRoleEnum } from './entities/message.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async findAll(
    chatId: number,
    withoutSystemMessages: boolean,
    sortDirection: FindOptionsOrderValue = 'DESC',
  ): Promise<Message[]> {
    const where: FindOptionsWhere<Message> = {
      chat: {
        id: chatId,
      },
    };

    if (withoutSystemMessages) {
      where.role = Not(MessageRoleEnum.SYSTEM);
    }

    return this.messageRepository.find({
      select: ['id', 'role', 'type', 'contents'],
      where: where,
      order: { created_at: sortDirection, id: sortDirection },
    });
  }

  async create(message: Message): Promise<Message> {
    return this.messageRepository.save(message);
  }
}
