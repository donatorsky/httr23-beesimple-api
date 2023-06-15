import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DelayMiddleware } from './middlewares/delay.middleware';
import { ChatController } from './chat.controller';
import { MessageController } from './message.controller';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { OpenAIService } from './openai.service';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { QueueProcessor } from './queue.processor';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      autoLoadEntities: true,
      synchronize: true, // Set to true for development, but false for production
    }),
    TypeOrmModule.forFeature([Chat, Message]),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'queue',
    }),
  ],
  controllers: [MessageController, ChatController],
  providers: [MessageService, ChatService, OpenAIService, QueueProcessor],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    //consumer.apply(DelayMiddleware).forRoutes('*');
  }
}
