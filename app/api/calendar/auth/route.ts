import { getSupabaseSSR } from '@/lib/supabase-server'
import { getAuthUrl } from '@/lib/google-calendar'
import { redirect } from 'next/navigation'

export async function GET() {
  const supabase = await getSupabaseSSR()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/admin/login')
  }

  // state = user.id, lai callback varētu saistīt ar meistaru
  const url = getAuthUrl(user.id)
  return redirect(url)
}
