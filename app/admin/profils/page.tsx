import { redirect } from 'next/navigation'
import { getSupabaseSSR } from '@/lib/supabase-server'
import ProfilsForma from './ProfilsForma'

export default async function ProfilsPage() {
  const supabase = await getSupabaseSSR()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: meistars } = await supabase
    .from('meistari')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!meistars) {
    return (
      <div className="text-center py-20 text-gray-400">
        Profils nav atrasts.
      </div>
    )
  }

  const { data: pakalpojumi } = await supabase
    .from('pakalpojumi')
    .select('*')
    .eq('meistars_id', meistars.id)
    .order('cena_no')

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#2C2C2A]">Profils</h1>
      <ProfilsForma meistars={meistars} pakalpojumi={pakalpojumi ?? []} />
    </div>
  )
}
