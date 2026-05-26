import { getSupabaseServer } from '@/lib/supabase'

export type WebhookEventType =
  | 'incoming_sms'
  | 'incoming_wa'
  | 'ja_response'
  | 'anketa_sent'
  | 'admin_notified'
  | 'invalid_signature'
  | 'unknown_sender'
  | 'error'

export type WebhookStatus = 'success' | 'error' | 'ignored'

export interface WebhookLogEntry {
  event_type: WebhookEventType
  status: WebhookStatus
  from_number?: string
  prospect_id?: string
  details?: Record<string, unknown>
  error_message?: string
}

/** Insert a webhook event into webhook_log. Never throws — logging must not crash the app. */
export async function logWebhookEvent(entry: WebhookLogEntry): Promise<void> {
  try {
    const supabase = getSupabaseServer()
    await supabase.from('webhook_log').insert({
      event_type: entry.event_type,
      status: entry.status,
      from_number: entry.from_number ?? null,
      prospect_id: entry.prospect_id ?? null,
      details: entry.details ?? null,
      error_message: entry.error_message ?? null,
    })
  } catch {
    // Intentionally swallowed — logging failures must not affect the response
  }
}

/** Retrieve webhook logs ordered by newest first. */
export async function getWebhookLogs(limit = 100, offset = 0) {
  const supabase = getSupabaseServer()
  const { data } = await supabase
    .from('webhook_log')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  return data ?? []
}

/** Delete logs older than 90 days (GDPR compliance). Returns count of deleted rows. */
export async function cleanupOldWebhookLogs(): Promise<number> {
  const supabase = getSupabaseServer()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)

  const { data } = await supabase
    .from('webhook_log')
    .delete()
    .lt('created_at', cutoff.toISOString())
    .select('id')

  return data?.length ?? 0
}
