@AGENTS.md
# Meistaru platforma — projekta konteksts

## Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase (DB + Auth + Storage)
- Google Calendar API (OAuth2)
- Make.com webhook → WhatsApp notifikācijas

## Projekta mērķis
Platforma latvijas amatniekiem (santehniķi, elektriķi u.c.) — katrs meistars saņem savu profila lapu ar booking sistēmu un kalendāra integrāciju. Subscription modelis €19–49/mēn.

## Direktoriju struktūra
```
app/
  page.tsx                  ← sākumlapa + meklēšana
  meistari/[slug]/page.tsx  ← publiskais profils
  admin/                    ← meistara dashboard
  api/                      ← backend routes
components/                 ← UI komponenti
lib/                        ← supabase, google-calendar, make
```

## DB tabulas (Supabase)
- meistari (id, vards, uzvards, specialitate, telefons, pilseta, slug, foto_url, aktīvs, rating)
- pakalpojumi (id, meistars_id, nosaukums, cena_no, ilgums_h)
- darba_tipi (id, nosaukums, ikona, slug)
- regioni (id, nosaukums, slug)
- meistars_darba_tipi (meistars_id, darba_tips_id)
- meistars_regioni (meistars_id, regions_id)
- booking (id, meistars_id, klients_vards, klients_telefons, pakalpojums, datums, laiks, google_event_id, statuss)
- atsauksmes (id, meistars_id, autors, teksts, vertejums, datums)
- kalendars_sync (meistars_id, google_refresh_token, google_calendar_id, sync_aktīvs)

## ENV mainīgie (.env.local)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- MAKE_WEBHOOK_URL

## Valoda
Viss UI — latviešu valodā.

## Koda stils
- Funktionāli komponenti + hooks
- Server components kur iespējams (datu iegūšana)
- Client components tikai kur vajag interaktivitāti ('use client')
- Tailwind klases — ne inline styles
- Kļūdu apstrāde katrā API route

## Fāzes
1. TAGAD: DB shēma + sākumlapa meklēšana + meistara profila lapa
2. Vēlāk: Admin panel + Google Calendar
3. Vēlāk: Stripe maksājumi