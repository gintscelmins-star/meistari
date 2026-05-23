import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  if (!rateLimit(req)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY nav iestatīts — izmanto manuālo režīmu' },
      { status: 400 }
    )
  }

  const { prompt } = await req.json().catch(() => ({}))
  if (!prompt) return NextResponse.json({ error: 'Trūkst prompt' }, { status: 400 })

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const apraksts = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ apraksts })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'API kļūda'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
