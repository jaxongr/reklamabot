import { Injectable, Logger } from '@nestjs/common';
import { YoldaConfigService } from '../config/yolda-config.service';

/**
 * Voice fayl Telegram guruhga yuboriladi. Buffer memory'da — diskka yozilmaydi.
 * Yuborilgandan keyin Buffer GC'ga tushadi, hech qanday saqlanish yo'q.
 */
@Injectable()
export class YoldaVoiceUploadService {
  private readonly logger = new Logger('YoldaVoiceUpload');

  constructor(private readonly config: YoldaConfigService) {}

  async sendVoiceToGroup(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    caption: string,
  ): Promise<{ messageId: number | null; chatId: string | null }> {
    const [groupId, botToken] = await Promise.all([
      this.config.getVoiceGroupId(),
      this.config.getBotToken(),
    ]);

    if (!groupId) throw new Error('Voice group ID sozlanmagan');
    if (!botToken) throw new Error('Bot token sozlanmagan');

    // Voice yoki Audio tanlash
    const isOgg = mimeType.includes('ogg') || mimeType.includes('opus') || filename.endsWith('.ogg') || filename.endsWith('.opus');
    const method = isOgg ? 'sendVoice' : 'sendAudio';
    const field = isOgg ? 'voice' : 'audio';

    const form = new FormData();
    form.append('chat_id', groupId);
    form.append('caption', caption.substring(0, 1024));
    form.append(field, new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);

    const url = `https://api.telegram.org/bot${botToken}/${method}`;
    const response = await fetch(url, { method: 'POST', body: form as any });
    const data: any = await response.json();

    if (!data.ok) {
      this.logger.error(`Telegram xato: ${JSON.stringify(data)}`);
      throw new Error(data.description || 'Telegram API xato');
    }

    return {
      messageId: data.result?.message_id || null,
      chatId: String(data.result?.chat?.id || groupId),
    };
  }
}
