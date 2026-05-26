import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { cleanupOldWebhookLogs } from '@/lib/webhook-logger'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServer()

  // Auth check — CRM only
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '100'), 500)
  const offset = Number(url.searchParams.get('offset') ?? '0')
  const eventType = url.searchParams.get('event_type') ?? undefined
  const status = url.searchParams.get('status') ?? undefined
  const from = url.searchParams.get('from') ?? undefined

  const baseQuery = supabase
    .from('webhook_log')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const withEvent = eventType ? baseQuery.eq('event_type', eventType) : baseQuery
  const withStatus = status ? withEvent.eq('status', status) : withEvent
  const { data, error } = from ? await withStatus.gte('created_at', from) : await withStatus

  if (error) return NextResponse.json({ logs: [] })
  return NextResponse.json({ logs: data ?? [] })
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deleted = await cleanupOldWebhookLogs()
  return NextResponse.json({ deleted })
}
