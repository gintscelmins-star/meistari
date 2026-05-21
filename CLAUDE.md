Izveido CLAUDE.md projekta saknē ar šādu saturu:

# ProMeistars CRM — projekta konteksts

## Stack
Next.js 14 App Router + TypeScript + Tailwind
Supabase (DB + Auth + Storage) — EU reģions
Twilio (SMS + WhatsApp)
Make.com webhooks
Vercel deploy → promeistars.lv

## Struktūra
app/page.tsx          ← portāla sākumlapa
app/crm/*             ← CRM (tikai admins)
app/api/crm/*         ← SMS/WA/webhook routes
app/api/gdpr/*        ← datu dzēšana
app/privacy/page.tsx  ← privacy policy
lib/                  ← supabase, twilio, rate-limit
supabase/migrations/  ← DB migrācijas

## DB tabulas
prospects, zinojumi, webhook_log,
meistari, pakalpojumi, booking, atsauksmes

## DevOps
Branches: main → develop → sprint/X-name
Commits: feat/fix/docs/chore/security/test
STOP pie: TypeScript error, build fail

## GDPR
Personas dati tikai Supabase EU
Dzēšana: /api/gdpr/erase
Glabāšana: max 2 gadi

## ENV (.env.local)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
TWILIO_WHATSAPP_NUMBER
MAKE_WEBHOOK_URL

## Sprinti
✅ Sprint 1: DevOps + GDPR
⬜ Sprint 2: Demo kartīte
⬜ Sprint 3: CRM UI
⬜ Sprint 4: SMS/WA + webhooks
⬜ Sprint 5: Jā workflow
⬜ Sprint 6: Follow-up + Ads

## DevOps standarti
Branch: main (prod) → develop → sprint/X-name
Commits: Conventional Commits formāts
  feat: / fix: / docs: / chore: / test: / security:
STOP pie: TypeScript error, build fail, test fail

## GDPR prasības
- Personas dati tikai Supabase (EU reģions)
- Telefona numuri: šifrēti atpūtā
- Datu dzēšanas API: DELETE /api/gdpr/erase
- Piekrišana: prospects.gdpr_piekrits = true
- Datu glabāšana: max 2 gadi bez aktivitātes
- Privacy policy lapa: /privacy

## Drošības prasības
- Visi /admin/* un /crm/* → auth middleware
- API routes → rate limiting (max 100 req/min)
- Webhook endpoints → signature verification
- ENV mainīgie → nekad nav kodā
- SQL → tikai parametrizēti vaicājumi (Supabase)

## Sprint statuss
✅ Sprint 1: DevOps + domēns + GDPR
⬜ Sprint 2: Demo kartīte
⬜ Sprint 3: CRM pamats
⬜ Sprint 4: SMS/WA + webhooks
⬜ Sprint 5: "Jā" workflow
⬜ Sprint 6: Follow-up + Ads prep