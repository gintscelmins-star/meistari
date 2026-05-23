import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  if (!rateLimit(req)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = getSupabaseServer()

  const { error } = await supabase
    .from('prospects')
    .update({ publiskets: false, publiskets_datums: null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
