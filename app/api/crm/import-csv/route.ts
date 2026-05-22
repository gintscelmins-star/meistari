import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

type CsvRinda = {
  vards: string
  uzvards: string
  telefons: string
  valoda: string
  regions: string
  nodarbosanas: string
}

function normalizeTelefons(t: string): string {
  const n = t.replace(/[\s\-().]/g, '').trim()
  if (!n) return ''
  if (n.startsWith('+371')) return n
  if (n.startsWith('00371')) return '+' + n.slice(2)
  if (n.startsWith('371') && n.length === 11) return '+' + n
  if (/^\d{8}$/.test(n)) return '+371' + n
  return n
}

export async function POST(req: NextRequest) {
  if (!rateLimit(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { rows: CsvRinda[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { rows } = body
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'Nav rindu' }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  // Iegūt visus esošos telefona numurus vienā vaicājumā
  const telefoni = rows.map(r => normalizeTelefons(r.telefons)).filter(Boolean)
  const { data: existing } = await supabase
    .from('prospects')
    .select('telefons')
    .in('telefons', telefoni)

  const existingSet = new Set((existing ?? []).map(e => e.telefons))

  const toInsert: CsvRinda[] = []
  const skipped: string[] = []

  for (const row of rows) {
    const tel = normalizeTelefons(row.telefons)
    if (!tel) continue
    if (existingSet.has(tel)) {
      skipped.push(tel)
    } else {
      toInsert.push({ ...row, telefons: tel })
    }
  }

  const errors: string[] = []
  let imported = 0

  if (toInsert.length > 0) {
    const insertData = toInsert.map(r => ({
      vards: r.vards?.trim() || '',
      uzvards: r.uzvards?.trim() || '',
      telefons: r.telefons,
      valoda: ['lv', 'ru'].includes(r.valoda?.trim().toLowerCase()) ? r.valoda.trim().toLowerCase() : 'lv',
      regions: r.regions?.trim() || null,
      nodarbosanas: r.nodarbosanas?.trim() || null,
      statuss: 'jauns',
      gdpr_piekrits: false,
      dzesanas_pieprasits: false,
      lapa_izveidota: false,
      anketa_aizpildita: false,
      anketa_apstiprinata: false,
      maksatajs: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from('prospects').insert(insertData)
    if (error) {
      errors.push(error.message)
    } else {
      imported = toInsert.length
    }
  }

  return NextResponse.json({
    imported,
    skipped: skipped.length,
    skipped_telefoni: skipped,
    errors,
  })
}
