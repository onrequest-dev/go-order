// go-order\app\Customer-Service\api\types.ts

export interface TelegramMessage {
  message: string;
  chatId?: string;
  parseMode?: 'Markdown' | 'HTML';
}

export interface TelegramFile {
  file: File;
  chatId?: string;
}

export interface SendResult {
  success: boolean;
  error?: string;
  messageId?: number;
}

export interface UploadProgress {
  current: number;
  total: number;
  fileName: string;
}