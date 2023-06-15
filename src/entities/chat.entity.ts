import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  status: ChatStatusEnum;

  @Column()
  type: ChatTypeEnum;

  @Column()
  language: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP', precision: 6 })
  created_at: Date;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}

export const ChatStatusEnum = {
  WAITING: 'WAITING',
  READY: 'READY',
} as const;

export type ChatStatusEnum =
  (typeof ChatStatusEnum)[keyof typeof ChatStatusEnum];

export const ChatTypeEnum = {
  TEXT: 'TEXT',
  PDF: 'PDF',
} as const;

export type ChatTypeEnum = (typeof ChatTypeEnum)[keyof typeof ChatTypeEnum];
