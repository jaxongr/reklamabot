/**
 * SMS providers — strategy pattern
 * Har bir provider alohida yuboradi, interface bir xil
 */

export interface SmsSendResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface SmsProviderStrategy {
  readonly name: string;
  send(phone: string, message: string): Promise<SmsSendResult>;
}

export type SmsProviderName = 'semysms' | 'sms_gateway';

// ============================================================
// SemySMS provider — eski, o'zgartirmaymiz
// ============================================================

const SEMYSMS_API = 'https://semysms.net/api/3';

export class SemySmsProvider implements SmsProviderStrategy {
  readonly name = 'semysms';

  constructor(
    private readonly token: string,
    private readonly deviceId: string,
  ) {}

  async send(phone: string, message: string): Promise<SmsSendResult> {
    try {
      const response = await fetch(`${SEMYSMS_API}/sms.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: this.token,
          device: this.deviceId,
          phone,
          msg: message,
        }),
      });

      const result = await response.json();

      if (result.code === '0' || result.code === 0) {
        return {
          success: true,
          externalId: result.id ? String(result.id) : undefined,
        };
      }

      return {
        success: false,
        error: result.error || JSON.stringify(result),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// ============================================================
// SMS Gateway provider — o'zimizning Android telefon gateway
// http://185.207.251.184:8086 — yoki sozlamada URL belgilanadi
// ============================================================

export class SmsGatewayProvider implements SmsProviderStrategy {
  readonly name = 'sms_gateway';

  constructor(
    private readonly apiUrl: string,
    private readonly apiKey: string,
  ) {}

  async send(phone: string, message: string): Promise<SmsSendResult> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({ to: phone, message }),
      });

      const result = await response.json();

      if (response.ok && (result.success !== false)) {
        return {
          success: true,
          externalId: result.taskId || result.id ? String(result.taskId || result.id) : undefined,
        };
      }

      return {
        success: false,
        error: result.message || result.error || `HTTP ${response.status}`,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
