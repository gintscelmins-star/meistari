import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import MeistaraLapa from '@/app/meistari/[slug]/MeistaraLapa'

type Params = { params: Promise<{ id: string }> }

export default async function MeistarsPreviewPage({ params }: Params) {
  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) redirect('/crm/login')

  const { id } = await params
  const supabase = getSupabaseServer()

  const { data: prospect } = await supabase
    .from('prospects')
    .select('id, vards, uzvards, nodarbosanas, regions, apraksts, telefons, foto_hero, foto_darbs_1, foto_darbs_2, foto_darbs_3, foto_darbs_4, foto_profils, darba_laiki, pakalpojumi, demo_slug, publiskets, publiskets_datums')
    .eq('id', id)
    .single()

  if (!prospect) notFound()

  return (
    <div>
      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-amber-400 text-amber-900 text-center py-2 px-4 text-sm font-semibold shadow-md flex items-center justify-center gap-4">
        <span>👁 PRIEKŠSKATĪJUMS — lapa nav publiski redzama</span>
        <Link href={`/crm/meistari/${id}/edit`}
          className="bg-amber-900 text-amber-100 text-xs px-3 py-1 rounded-full hover:bg-amber-800 transition">
          ← Atpakaļ uz redaktoru
        </Link>
        {prospect.publiskets && (
          <a href={`/meistari/${prospect.demo_slug}`} target="_blank" rel="noopener"
            className="bg-green-700 text-white text-xs px-3 py-1 rounded-full hover:bg-green-600 transition">
            Skatīt live →
          </a>
        )}
      </div>

      <MeistaraLapa meistars={{
        id: prospect.id,
        vards: prospect.vards,
        uzvards: prospect.uzvards,
        nodarbosanas: prospect.nodarbosanas,
        regions: prospect.regions,
        apraksts: prospect.apraksts,
        telefons: prospect.telefons,
        foto_hero: prospect.foto_hero,
        foto_darbs_1: prospect.foto_darbs_1,
        foto_darbs_2: prospect.foto_darbs_2,
        foto_darbs_3: prospect.foto_darbs_3,
        foto_darbs_4: prospect.foto_darbs_4,
        foto_profils: prospect.foto_profils,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        darba_laiki: prospect.darba_laiki as any,
        pakalpojumi: prospect.pakalpojumi,
      }} />
    </div>
  )
}
