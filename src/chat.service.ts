import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) {}

  async findAll(): Promise<Chat[]> {
    return this.chatRepository.find({
      select: ['id', 'status', 'title'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async create(chat: Chat): Promise<Chat> {
    return this.chatRepository.save(chat);
  }

  async update(chat: Chat): Promise<Chat> {
    return this.chatRepository.save(chat);
  }

  async getById(id: number): Promise<Chat> {
    return this.chatRepository.findOneBy({
      id: id,
    });
  }
}
