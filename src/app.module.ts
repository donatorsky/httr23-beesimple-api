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
  ],
  controllers: [MessageController, ChatController],
  providers: [MessageService, ChatService, OpenAIService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DelayMiddleware).forRoutes('*');
  }
}
