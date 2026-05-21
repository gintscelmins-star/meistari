import { getSupabaseServer } from '@/lib/supabase'
import { getFreeBusy } from '@/lib/google-calendar'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  if (!rateLimit(request)) {
    return NextResponse.json(
      { error: 'Pārāk daudz pieprasījumu' },
      { status: 429 }
    )
  }

  const { searchParams } = request.nextUrl
  const meistarsId = searchParams.get('meistars_id')
  const datums = searchParams.get('datums') // YYYY-MM-DD

  if (!meistarsId || !datums) {
    return Response.json({ error: 'Trūkst parametri' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseServer()

    const { data: sync } = await supabase
      .from('kalendars_sync')
      .select('*')
      .eq('meistars_id', meistarsId)
      .single()

    if (!sync?.['sync_aktīvs'] || !sync.google_refresh_token || !sync.google_calendar_id) {
      return Response.json({ busy: [] })
    }

    const timeMin = `${datums}T00:00:00+02:00`
    const timeMax = `${datums}T23:59:59+02:00`

    const busy = await getFreeBusy(
      sync.google_refresh_token,
      sync.google_calendar_id,
      timeMin,
      timeMax
    )

    return Response.json({ busy })
  } catch {
    return Response.json({ busy: [] })
  }
}
