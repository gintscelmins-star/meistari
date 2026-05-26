import twilio from 'twilio'
export { SMS_TEKSTI } from './sms-teksti'

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

/** Normalize Latvian phone number to E.164 (+371XXXXXXXX). */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-().]/g, '')
  if (cleaned.startsWith('+')) return cleaned
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2)
  if (cleaned.startsWith('371') && cleaned.length === 11) return '+' + cleaned
  if (/^\d{8}$/.test(cleaned)) return '+371' + cleaned
  return cleaned
}

const RETRY_DELAYS_MS = [500, 1000, 2000] // exponential backoff
const BULK_DELAY_MS = 100                  // 100ms between messages

async function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

async function sendWithRetry(
  fn: () => Promise<{ sid: string }>
): Promise<{ success: boolean; sid?: string; error?: string }> {
  for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
    try {
      const result = await fn()
      return { success: true, sid: result.sid }
    } catch (e: unknown) {
      if (i === RETRY_DELAYS_MS.length) {
        return { success: false, error: e instanceof Error ? e.message : String(e) }
      }
      await sleep(RETRY_DELAYS_MS[i])
    }
  }
  return { success: false, error: 'Max retries exceeded' }
}

/** Send a single SMS or WhatsApp message with automatic retry. */
export async function sendTwilioMessage(
  phone: string,
  message: string,
  type: 'sms' | 'whatsapp' = 'sms'
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const normalized = normalizePhoneNumber(phone)
  const from =
    type === 'whatsapp'
      ? `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`
      : process.env.TWILIO_PHONE_NUMBER!
  const to = type === 'whatsapp' ? `whatsapp:${normalized}` : normalized

  return sendWithRetry(() =>
    twilioClient.messages.create({ body: message, from, to })
  )
}

/** Send messages to multiple recipients, 100ms apart to avoid Twilio rate limit. */
export async function sendTwilioMessageBulk(
  recipients: Array<{ phone: string; message: string }>,
  type: 'sms' | 'whatsapp' = 'sms'
): Promise<Array<{ phone: string; success: boolean; sid?: string; error?: string }>> {
  const results: Array<{ phone: string; success: boolean; sid?: string; error?: string }> = []

  for (const r of recipients) {
    const result = await sendTwilioMessage(r.phone, r.message, type)
    results.push({ phone: r.phone, ...result })
    await sleep(BULK_DELAY_MS)
  }

  return results
}

/** Send a message built from a template function. */
export async function sendTemplateMessage(
  phone: string,
  template: (phone: string) => string,
  type: 'sms' | 'whatsapp' = 'sms'
): Promise<{ success: boolean; sid?: string; error?: string }> {
  return sendTwilioMessage(phone, template(phone), type)
}

/** Fetch Twilio account status — useful for connection health checks. */
export async function getTwilioInfo(): Promise<{
  accountSid: string
  friendlyName: string
  status: string
} | null> {
  try {
    const account = await twilioClient.api
      .accounts(process.env.TWILIO_ACCOUNT_SID!)
      .fetch()
    return {
      accountSid: account.sid,
      friendlyName: account.friendlyName,
      status: account.status,
    }
  } catch {
    return null
  }
}
