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
  status: StatusEnum;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP', precision: 6 })
  created_at: Date;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}

export const StatusEnum = {
  WAITING: 'WAITING',
  READY: 'READY',
} as const;

export type StatusEnum = (typeof StatusEnum)[keyof typeof StatusEnum];
