import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { Module } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { MessageController } from './message.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
