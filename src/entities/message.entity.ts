import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from './chat.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.messages, { nullable: false })
  @JoinColumn({ name: 'chat_id', referencedColumnName: 'id' })
  chat: Chat;

  @Column()
  role: MessageRoleEnum;

  @Column()
  type: MessageTypeEnum;

  @Column()
  contents: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP', precision: 3 })
  created_at: Date;
}

export const MessageRoleEnum = {
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  USER: 'user',
} as const;

export type MessageRoleEnum =
  (typeof MessageRoleEnum)[keyof typeof MessageRoleEnum];

export const MessageTypeEnum = {
  SYSTEM: 'SYSTEM',
  MESSAGE: 'MESSAGE',
  FILE: 'FILE',
} as const;

export type MessageTypeEnum =
  (typeof MessageTypeEnum)[keyof typeof MessageTypeEnum];
