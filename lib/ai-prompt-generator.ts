export type PromptMeistars = {
  vards: string
  uzvards: string
  kategorijas?: string[] | null
  nodarbosanas?: string | null
  pieredze_gadi?: number | null
  regions?: string[] | string | null
  darba_laiki?: unknown
  avarijas_24_7?: boolean | null
  pakalpojumi_detail?: Array<{ nosaukums: string }> | null
  sertificets?: boolean | null
}

export function generateAprakstsPrompt(meistars: PromptMeistars): string {
  const spec = meistars.kategorijas?.join(', ')
    || meistars.nodarbosanas
    || 'meistars'

  const regions = Array.isArray(meistars.regions)
    ? meistars.regions[0]
    : typeof meistars.regions === 'string'
      ? meistars.regions.split(',')[0]?.trim()
      : null

  const pakStr = meistars.pakalpojumi_detail
    ?.map(p => p.nosaukums)
    .filter(Boolean)
    .join(', ') || ''

  const darbaLaiks = meistars.avarijas_24_7
    ? 'Pieejams avārijas izsaukumiem 24/7'
    : 'Strādā darba dienās un nedēļas nogalēs'

  return `Tu esi profesionāls copywriter Latvijas meistaru pakalpojumu lapām.

Uzdevums: uzraksti īsu, uzticamu, SEO optimizētu aprakstu latviešu valodā par šo meistaru.

Vārds: ${meistars.vards} ${meistars.uzvards}
Specialitāte: ${spec}
Pieredze: ${meistars.pieredze_gadi ? `${meistars.pieredze_gadi} gadi` : 'nav norādīts'}${regions ? `\nPilsēta: ${regions}` : ''}${pakStr ? `\nGalvenie pakalpojumi: ${pakStr}` : ''}
${meistars.sertificets ? 'Sertificēts speciālists: Jā' : ''}
${darbaLaiks}

PRASĪBAS:
- Max 80 vārdi (3-4 teikumi)
- Tonis: profesionāls bet sirsnīgs
- Iekļaut: pieredzi, pilsētu, galvenos pakalpojumus
- SEO: minēt specialitāti + pilsētu
- Bez "es", "mēs", "jūs" — tikai 3. persona
- Latviešu valoda

PIEMĒRS:
"Pieredzējis santehniķis ar 12 gadu pieredzi Rīgā. Strādā ātri, tīri un ar garantiju. Specializējas santehnikas darbos, kanalizācijā un apkures sistēmās. Pieejams avārijas izsaukumiem 7 dienas nedēļā."

Tagad uzraksti aprakstu par ${meistars.vards}:`
}

export function generateTulkojumsPrompt(teksts: string): string {
  return `Iztulko šo tekstu uz latviešu valodu. Saglabā profesionālo toni un nemaini nozīmi:

${teksts}

Atbildi tikai ar tulkojumu, bez paskaidrojumiem.`
}
