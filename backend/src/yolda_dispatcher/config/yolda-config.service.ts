import { Injectable } from '@nestjs/common';
import { SystemConfigService } from '../../common/system-config.service';

const KEY_VOICE_GROUP = 'yolda_voice_telegram_group';
const KEY_BOT_TOKEN = 'yolda_voice_bot_token';

@Injectable()
export class YoldaConfigService {
  constructor(private readonly systemConfig: SystemConfigService) {}

  async getVoiceGroupId(): Promise<string | null> {
    return (await this.systemConfig.get(KEY_VOICE_GROUP)) || null;
  }

  async setVoiceGroupId(groupId: string) {
    await this.systemConfig.set(
      KEY_VOICE_GROUP,
      groupId,
      'STRING' as any,
      'Yolda dispatcher — voice xabarlar yuboriladigan Telegram guruh ID',
    );
  }

  async getBotToken(): Promise<string | null> {
    const fromDb = await this.systemConfig.get(KEY_BOT_TOKEN);
    return fromDb || process.env.YOLDA_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || null;
  }

  async setBotToken(token: string) {
    await this.systemConfig.set(
      KEY_BOT_TOKEN,
      token,
      'STRING' as any,
      'Yolda dispatcher — voice yuboruvchi bot tokeni',
    );
  }
}
