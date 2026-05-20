@AGENTS.md
# Meistaru platforma — projekta konteksts

## Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase (DB + Auth + Storage)
- Google Calendar API (OAuth2)
- Make.com webhook → WhatsApp notifikācijas

## Projekta mērķis
Platforma latvijas amatniekiem — katrs meistars saņem
savu profila lapu ar booking sistēmu. Subscription €19–49/mēn.
/admin sadaļa IR meistara personīgā sadaļa. Nav super-admin.
Katrs meistars redz tikai savus datus (RLS).

## Pašreizējais statuss
✅ Fāze 1: DB + sākumlapa + profila lapa + booking + WhatsApp
✅ Fāze 2: Admin panel + auth middleware + RLS
🔄 Fāze 3: Foto upload + reģistrācija + Google Calendar
⬜ Fāze 4: Stripe maksājumi

## DB tabulas
### Esošās
- meistari (id, vards, uzvards, specialitate, telefons,
  pilseta, slug, foto_url, aktīvs, rating, user_id)
- pakalpojumi (id, meistars_id, nosaukums, cena_no, ilgums_h)
- darba_tipi (id, nosaukums, ikona, slug)
- regioni (id, nosaukums, slug)
- meistars_darba_tipi (meistars_id, darba_tips_id)
- meistars_regioni (meistars_id, regions_id)
- booking (id, meistars_id, klients_vards, klients_telefons,
  pakalpojums, datums, laiks, google_event_id, statuss)
- atsauksmes (id, meistars_id, autors, teksts, vertejums, datums)
- kalendars_sync (meistars_id, google_refresh_token,
  google_calendar_id, sync_aktīvs)

### Jaunās (003 migrācija)
- pakalpojumu_kategorijas (id, darba_tips_id, nosaukums, kartiba)
- standartu_pakalpojumi (id, kategorija_id, nosaukums, kartiba)
- meistara_pakalpojumi (id, meistars_id, standartu_pakalpojums_id,
  cena_no, cena_lidz, apraksts)
- meistara_foto (id, meistars_id, url, apraksts, kartiba)
- darba_laiki (id, meistars_id, dienas_nr, no_laiks,
  lidz_laiks, strada)

## Admin navigācija (/admin/*)
- /admin → rezervāciju saraksts + statusa maiņa
- /admin/profils → profila info + foto upload
- /admin/pakalpojumi → darba veidi + cenas + apraksti
- /admin/darba-laiki → nedēļas darba grafiks
- /admin/kalendars → Google Calendar OAuth
- /admin/login → ieeja

## ENV mainīgie (.env.local)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- MAKE_WEBHOOK_URL

## Koda stils
- Server components datu iegūšanai, 'use client' tikai interaktivitātei
- Tailwind klases, ne inline styles
- Kļūdu apstrāde katrā API route
- Latviešu valoda visur UI
