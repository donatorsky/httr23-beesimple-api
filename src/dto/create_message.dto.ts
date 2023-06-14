export class CreateMessageDto {
  chat_id: number;
  role: string;
  type: string;
  contents: string;
}
