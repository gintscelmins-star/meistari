export type PublishMeistars = {
  vards?: string | null
  uzvards?: string | null
  telefons?: string | null
  kategorijas?: string[] | null
  regions?: string | null
  apraksts?: string | null
  foto_hero?: string | null
  pakalpojumi_detail?: unknown
  demo_slug?: string | null
}

export function canPublish(meistars: PublishMeistars): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!meistars.vards?.trim()) errors.push('Nav vārda')
  if (!meistars.uzvards?.trim()) errors.push('Nav uzvārda')
  if (!meistars.telefons?.trim()) errors.push('Nav telefona')
  if (!meistars.kategorijas?.length) errors.push('Nav kategorijas')
  if (!meistars.regions?.trim()) errors.push('Nav reģiona')
  if (!meistars.apraksts?.trim()) errors.push('Nav apraksta')
  if (!meistars.foto_hero) errors.push('Nav hero foto')

  const paks = Array.isArray(meistars.pakalpojumi_detail) ? meistars.pakalpojumi_detail : []
  if (paks.length === 0) errors.push('Nav pakalpojumu')

  if (!meistars.demo_slug?.trim()) {
    errors.push('Nav slug')
  } else if (!/^[a-z0-9-]+$/.test(meistars.demo_slug)) {
    errors.push('Slug var saturēt tikai: a-z, 0-9, -')
  }

  return { valid: errors.length === 0, errors }
}
