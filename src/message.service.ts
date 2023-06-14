import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async findAll(chatId: number): Promise<Message[]> {
    return this.messageRepository.find({
      select: ['id', 'role', 'type', 'contents'],
      where: { chat: { id: chatId } },
      order: { created_at: 'DESC', id: 'DESC' },
    });
  }

  async create(message: Message): Promise<Message> {
    return this.messageRepository.save(message);
  }
}
