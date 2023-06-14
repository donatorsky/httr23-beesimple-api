import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from './entities/chat.entity';
import { Module } from '@nestjs/common';
import { MessageModule } from './message.module';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chat]), MessageModule],
  providers: [ChatService, MessageService],
  controllers: [ChatController],
})
export class ChatModule {}
