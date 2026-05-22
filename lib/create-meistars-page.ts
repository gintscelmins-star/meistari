import { getSupabaseServer } from '@/lib/supabase'

const SITE_URL = 'https://promeistars.lv'

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createMeistaraLapa(prospectId: string): Promise<string | null> {
  const supabase = getSupabaseServer()

  const { data: prospect } = await supabase
    .from('prospects')
    .select('id, vards, uzvards, nodarbosanas, demo_slug, lapa_izveidota')
    .eq('id', prospectId)
    .single()

  if (!prospect) return null
  if (prospect.lapa_izveidota) {
    const { data: existing } = await supabase
      .from('prospects')
      .select('demo_url')
      .eq('id', prospectId)
      .single()
    return existing?.demo_url ?? null
  }

  const slug =
    prospect.demo_slug ||
    slugify(`${prospect.vards}-${prospect.uzvards}${prospect.nodarbosanas ? '-' + prospect.nodarbosanas : ''}`)

  const demoUrl = `${SITE_URL}/meistari/${slug}`

  const now = new Date()
  const trialBeigas = new Date(now)
  trialBeigas.setDate(trialBeigas.getDate() + 14)

  await supabase
    .from('prospects')
    .update({
      demo_slug: slug,
      demo_url: demoUrl,
      trial_sakums: now.toISOString(),
      trial_beigas: trialBeigas.toISOString(),
      statuss: 'demo_nosutits',
      lapa_izveidota: true,
      updated_at: now.toISOString(),
    })
    .eq('id', prospectId)

  return demoUrl
}
