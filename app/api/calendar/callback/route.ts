import { getSupabaseServer } from '@/lib/supabase'
import { getTokensFromCode } from '@/lib/google-calendar'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state') // user_id
  const error = searchParams.get('error')

  if (error || !code || !state) {
    return redirect('/admin/kalendars?error=access_denied')
  }

  try {
    const tokens = await getTokensFromCode(code)

    if (!tokens.refresh_token) {
      return redirect('/admin/kalendars?error=no_refresh_token')
    }

    const supabase = getSupabaseServer()

    // Atrod meistaru pēc user_id (state)
    const { data: meistars } = await supabase
      .from('meistari')
      .select('id')
      .eq('user_id', state)
      .single()

    if (!meistars) {
      return redirect('/admin/kalendars?error=meistars_not_found')
    }

    // Saglabā refresh_token un iespējo sync
    // Izmanto 'primary' kā noklusējuma kalendāru
    const { error: dbError } = await supabase
      .from('kalendars_sync')
      .upsert({
        meistars_id: meistars.id,
        google_refresh_token: tokens.refresh_token,
        google_calendar_id: 'primary',
        sync_aktīvs: true,
      }, { onConflict: 'meistars_id' })

    if (dbError) {
      return redirect('/admin/kalendars?error=db_error')
    }

    return redirect('/admin/kalendars?success=1')
  } catch {
    return redirect('/admin/kalendars?error=token_exchange')
  }
}
