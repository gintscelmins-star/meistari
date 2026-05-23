# Sprint 6B — AI Apraksta Ģenerators

**Datums:** 2026-05-23
**Branch:** sprint/6b-ai-apraksts → develop → master

## Mērķis

Pievienot AI apraksta ģeneratoru CRM meistara rediģēšanas lapai (Section 9 — Apraksts par sevi). Administrators var ģenerēt profesionālu, SEO optimizētu aprakstu latviešu valodā, izmantojot meistara profila datus.

## Izveidotie faili

### `lib/ai-prompt-generator.ts`
Prompt ģenerēšanas palīgfunkcijas:
- `generateAprakstsPrompt(meistars)` — ģenerē LV copywriting prompt no meistara datiem
- `generateTulkojumsPrompt(teksts)` — ģenerē tulkošanas prompt no RU/citas valodas uz LV

### `app/api/ai/generate-apraksts/route.ts`
POST `/api/ai/generate-apraksts`
- Auth: Supabase SSR (nepieciešama autorizācija)
- Rate limiting: 100 req/min
- Input: `{ prompt: string }`
- Output: `{ apraksts: string }` vai `{ error: string }`
- Izmanto Anthropic SDK (`claude-sonnet-4-5`, max_tokens: 500)
- Ja `ANTHROPIC_API_KEY` nav iestatīts → 400 kļūda ar instrukciju

### `app/crm/(protected)/meistari/[id]/edit/page.tsx` (izmainīts)
Section 9 paplašināts ar:
- **"✨ Ģenerēt ar AI"** poga (purple) blakus apraksta labelam
- **Modālis** ar diviem režīmiem:
  - **Manuālais režīms** — readonly prompt textarea, "📋 Kopēt" poga, saite uz Claude.ai, paste lauks rezultātam
  - **Auto režīms (API)** — "⚡ Ģenerēt" poga, automātiski izsauc `/api/ai/generate-apraksts`
- **"🇱🇻 Iztulkot uz latviešu valodu"** poga (amber) — parādās ja ir rezultāts, izsauc tulkošanas API
- **"Saglabāt aprakstu"** → ieraksta rezultātu formā un aizver modāli

## Kā tas strādā

1. Admin atver meistara rediģēšanas lapu
2. Nospiedz "✨ Ģenerēt ar AI" → atveras modālis
3. **Manuālais režīms** (noklusējums):
   - Redzams gatavs prompt ar meistara datiem (specialitāte, pieredze, reģions, pakalpojumi)
   - Nokopē prompt → atver Claude.ai → ielīmē → kopē atbildi → ielīmē atpakaļ modālī
4. **Auto režīms**:
   - Nospiedz "⚡ Ģenerēt" → API izsauc Claude → parādās rezultāts
   - Rediģējams inline
5. Ja teksts ir RU → nospiedz "🇱🇻 Iztulkot" → auto tulkojums
6. Nospiedz "Saglabāt aprakstu" → aizpilda apraksta lauku formā

## ENV prasības

```
ANTHROPIC_API_KEY=sk-ant-...   ← nepieciešams auto režīmam
```

Ja nav iestatīts → auto режīms atgriež 400 kļūdu ar skaidrojumu. Manuālais режīms darbojas bez API atslēgas.

## Dependency

```bash
npm install @anthropic-ai/sdk
```

## Prompt struktūra

Prompts iekļauj:
- Meistara vārdu un uzvārdu
- Specialitāti (kategorijas vai nodarbošanās)
- Pieredzes gadus
- Pilsētu/reģionu
- Galvenos pakalpojumus
- Sertifikāciju
- Darba laiku (vai 24/7)

Prasības aprakstam: max 80 vārdi, 3-4 teikumi, profesionāls tonis, SEO optimizēts, 3. persona, LV.
