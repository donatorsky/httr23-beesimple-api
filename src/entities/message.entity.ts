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
  role: string;

  @Column()
  type: string;

  @Column()
  contents: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP', precision: 3 })
  created_at: Date;
}
