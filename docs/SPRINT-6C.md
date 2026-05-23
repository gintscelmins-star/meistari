# Sprint 6C — Publicēšanas sistēma

**Datums:** 2026-05-23
**Branch:** sprint/6c-publicet → develop → master

## Mērķis

[Publicēt lapu] poga CRM meistara rediģēšanas lapā — meistara lapa kļūst live, sākas 14 dienu trial, meistars saņem SMS ar linku.

## Izmaiņas

### `lib/validate-publish.ts` (jauns)
Validācija pirms publicēšanas:
- Obligātie lauki: vards, uzvards, telefons, kategorijas, regions, apraksts, foto_hero, pakalpojumi_detail
- Slug validācija: tikai a-z, 0-9, -

### `app/api/crm/meistari/[id]/publish/route.ts` (jauns)
POST `/api/crm/meistari/:id/publish`
- Auth + rate limiting
- Validē meistara datus
- Pārbauda slug unikalitāti
- Ieraksta: `publiskets=true`, `publiskets_datums`, `trial_sakums`, `trial_beigas` (+14d), `demo_url`
- Nosūta SMS meistarim (LV/RU)
- Nosūta WA paziņojumu Gintam

### `app/api/crm/meistari/[id]/unpublish/route.ts` (jauns)
POST `/api/crm/meistari/:id/unpublish`
- Ieraksta: `publiskets=false`, `publiskets_datums=null`

### `app/crm/(protected)/meistari/[id]/edit/page.tsx` (mainīts)
- Stāvokļi: `publishedAt`, `publishing`
- Funkcijas: `handlePublish()`, `handleUnpublish()`
- Apakšā: `📢 Publicēt lapu` (zaļa) vai `✅ Publicēts dd.mm.yyyy + [Noņemt]`

### `app/meistari/[slug]/page.tsx` (mainīts)
- Filtrs mainīts no `anketa_apstiprinata=true` uz `publiskets=true`
- Ja nav publicēts → "Lapa nav atrasta" skats
- `meistari` tabulas fallback saglabāts

### `app/api/crm/prospects/route.ts` (mainīts)
- `publiskets`, `publiskets_datums` pievienoti SELECT
- Jauns `filter` params: `melnraksti` / `publiceti` / `trial_beidzas` / `featured`
- Stats papildināts: `publiceti`, `trial_beidzas`, `featured`

### `app/crm/(protected)/page.tsx` (mainīts)
- Prospect tips: +`publiskets`, `publiskets_datums`
- Stats tips: +`publiceti`, `trial_beidzas`, `featured`
- Jauni tabs: ✅ Publicēti | Melnraksti | ⏰ Trial beidzas | ⭐ Featured
- Tabulas kolonna "Publicēts": ✅/❌

## Publicēšanas flow

1. Admin aizpilda meistara formu → saglabā
2. Nospiedz `📢 Publicēt lapu`
3. Confirm dialogs ar URL
4. API validē, ieraksta DB, nosūta SMS + WA
5. Poga mainās uz `✅ Publicēts dd.mm.yyyy` + `[Noņemt]`
6. Meistara lapa live uz `promeistars.lv/meistari/{slug}`

## Testēšana
- [ ] Publicēt bez hero foto → kļūda "Nav hero foto"
- [ ] Publicēt ar pilniem datiem → SMS nosūtīts
- [ ] Lapa pieejama uz `/meistari/{slug}`
- [ ] Nepublicēts slug → "Lapa nav atrasta"
- [ ] CRM ✅ Publicēti tabs → rāda publicētos
- [ ] [Noņemt] → lapa vairs nav pieejama

## Nākamais: Sprint 6D — Meistara login
