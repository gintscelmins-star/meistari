import { redirect } from 'next/navigation'
import { getSupabaseSSR } from '@/lib/supabase-server'
import ProfilsForma from './ProfilsForma'
import FotoGalerija from '../foto/FotoGalerija'

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

  const [{ data: pakalpojumi }, { data: foto }] = await Promise.all([
    supabase.from('pakalpojumi').select('*').eq('meistars_id', meistars.id).order('cena_no'),
    supabase.from('meistara_foto').select('*').eq('meistars_id', meistars.id).order('kartiba').order('created_at'),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#2C2C2A]">Profils</h1>
      <ProfilsForma meistars={meistars} pakalpojumi={pakalpojumi ?? []} />

      <div className="rounded-2xl bg-white border border-border p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-foreground">Darbu foto galerija</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pievienojiet darbu piemēru attēlus. Maks. 10 fotogrāfijas.
          </p>
        </div>
        <FotoGalerija meistarsId={meistars.id} initialFoto={foto ?? []} />
      </div>
    </div>
  )
}
