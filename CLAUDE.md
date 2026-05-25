# ProMeistars CRM — projekta konteksts

## Stack
Next.js 14 App Router + TypeScript + Tailwind
Supabase (DB + Auth + Storage) — EU reģions (project: iwpmvqomdrglwpaaeuic)
Twilio (SMS + WhatsApp)
Make.com webhooks
Vercel deploy → promeistars.lv

## Struktūra
app/page.tsx                     ← portāla sākumlapa (LV/RU, MeistariGrid)
app/register/*                   ← meistara reģistrācija
app/anketa/[code]/*              ← anketa ar foto upload, specialitātes, reģioni
app/meistari/[slug]/*            ← publiskā profila lapa
app/admin/*                      ← meistara admin (profils, foto, pakalpojumi, darba laiki, kalendārs)
app/crm/*                        ← CRM (tikai Gints/admins)
app/api/crm/*                    ← SMS/WA/webhook/bulk/import routes
app/api/anketa/*                 ← anketas iesniegšana + foto upload
app/api/public/meistari          ← publiskais GET, nav auth
app/api/gdpr/*                   ← datu dzēšana
app/privacy/page.tsx             ← privacy policy
lib/                             ← supabase, supabase-server, twilio, rate-limit
supabase/migrations/             ← DB migrācijas (001–011)

## DB tabulas
prospects      ← potenciālie meistari (galvenā CRM tabula)
zinojumi       ← SMS/WA sarakste (virziens: in/out)
webhook_log    ← Twilio webhook žurnāls
meistari       ← apstiprināti meistari (nākotnē)
pakalpojumi    ← meistara pakalpojumi + cenas
booking        ← klientu rezervācijas
atsauksmes     ← klientu atsauksmes (tabula ir, UI nav)

## prospects tabulas svarīgie lauki
id, vards, uzvards, telefons, whatsapp, email
valoda (lv/ru), regions, nodarbosanas, ss_url
statuss: jauns → nosutits → atbildeja → anketa_nosutita → gaida_apstiprinasanu → demo_nosutits → maksatajs | atteicas
anketa_unique_code, anketa_aizpildita, anketa_apstiprinata
lapa_izveidota, demo_slug, demo_url
gdpr_piekrits, dzesanas_pieprasits (soft delete)
piezimes, pedeja_kontakts, trial_sakums, trial_beigas

## ENV (.env.local)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
TWILIO_WHATSAPP_NUMBER
ADMIN_WHATSAPP          ← admina WA numurs paziņojumiem
MAKE_WEBHOOK_URL

## DevOps standarti
Branch: main (prod) → develop → sprint/X-name vai fix/X-name
Commits: feat: / fix: / docs: / chore: / test: / security:
Merge secība: sprint branch → develop → master → push visi trīs
STOP pie: TypeScript error, build fail

## GDPR prasības
- Personas dati tikai Supabase (EU reģions)
- Datu dzēšanas API: POST /api/gdpr/erase (soft delete → dzesanas_pieprasits=true)
- Piekrišana: prospects.gdpr_piekrits = true
- Datu glabāšana: max 2 gadi bez aktivitātes
- Privacy policy: /privacy

## Drošības prasības
- Visi /admin/* un /crm/* → Supabase SSR auth middleware
- API routes → rate limiting (max 100 req/min) — lib/rate-limit.ts
- Webhook endpoints → Twilio paraksta verifikācija (TODO — pašlaik nav!)
- ENV mainīgie → nekad nav kodā
- SQL → tikai parametrizēti vaicājumi (Supabase client)

## Sprint statuss

### ✅ Sprint 1 — DevOps + domēns + GDPR
- Vercel deploy, domēns promeistars.lv
- Supabase projekts (EU), auth, DB shēma
- GDPR: soft delete, privacy policy, /api/gdpr/erase

### ✅ Sprint 2 — Demo kartīte + publiskā lapa
- /meistari/[slug] — pilna profila lapa (MeistarsProfils, FotoGalerija, StickyMobileCTA)
- /meistari/demo-santehnikis — demo lapa ar fiktīviem datiem
- MeistariGrid — rāda DB meistarus + demo kartītes, visa kartīte klikšķināma
- /api/public/meistari — publiskais GET endpoint (60s cache)
- next.config.ts: remotePatterns pravatar.cc + *.supabase.co

### ✅ Sprint 3 — CRM pamats
- /crm — prospects saraksts ar statusa filtriem, stats kartītēm
- /crm/prospects/[id] — detaļu lapa, statusa maiņa
- /crm/prospects/new — jauna prospect manuāla pievienošana
- /crm/import — CSV imports (tab/komats, header auto-detekcija, phone-only mode)
  - Kolonnas: Vārds, Telefons, Valoda, Reģions, Specialitāte, URL (ss.lv)
  - Dedup pēc telefona (izlaiž soft-dzēstos)
  - Telefons normalizācija → +371XXXXXXXX
- Bulk actions: SMS, WA, statusa maiņa, dzēšana vairākiem uzreiz
- /api/crm/prospects, /api/crm/bulk, /api/crm/import-csv

### ✅ Sprint 4 — SMS/WA + Twilio webhook
- /api/crm/send-sms, /api/crm/send-whatsapp — individuāla sūtīšana
- /api/crm/bulk — masveidus SMS/WA ar zinojumi logu
- /api/crm/webhook — Twilio incoming webhook:
  - Atpazīst "Jā/да/ok/..." → auto nosūta anketas saiti
  - Statuss → atbildeja, pedeja_kontakts atjaunots
  - Admin paziņojums uz ADMIN_WHATSAPP

### ✅ Sprint 5 — Anketa + "Jā" workflow
- /anketa/[code] — anketa ar:
  - Specialitātes multi-select (Santehniķis/Elektriķis/Remontdarbi/Cits + brīvteksts)
  - Reģioni no latvijas-pilsetas.ts hierarhija (pilsēta → rajoni)
  - Foto upload uz Supabase Storage
- /api/anketa/submit — saglabā anketu, statuss → gaida_apstiprinasanu
- /api/crm/approve-meistars/[id] — apstiprina meistaru (lapa_izveidota=true)
- DB: nodarbosanas constraints atcelti (jebkāds teksts atļauts)

### ✅ Sprint 6 — Meistara admin panelis (daļēji)
- /admin — profila, foto, pakalpojumi, darba laiki redaktori (uzbūvēti)
- /api/calendar — Google Calendar OAuth (uzbūvēts, nav testēts end-to-end)
- /api/booking — rezervāciju pieņemšana (uzbūvēts, nav savienots ar UI pilnībā)
- TODO: Atsauksmes UI (tabula ir, UI nav)

### ✅ Sprint 6E — Brand rebrand
- components/Logo.tsx, Header.tsx, Footer.tsx
- Root layout globālie meta tags (OG, Twitter, SEO, canonical)
- Sākumlapa izmanto Logo + Footer komponentus
- Meistaru profilu lapas footer backlink uz ProMeistars
- SMS šabloni rebrandoti ar ProMeistars parakstu
- lib/email-templates.ts — welcome, published, trialEnding šabloni

### ✅ Sprint 6F — Featured slots (TOP 5)
- DB migrations 012 (full_profile) + 013 (featured_slots)
  - featured, featured_lidz, featured_sakums, featured_beigas, featured_prioritate kolonnas
  - featured_meistari VIEW
- CRM edit: ⭐ checkbox + prioritāte (1–10) + sākuma/beigu datetime lauki
- /api/public/featured — publisks endpoint portāla lapai
- Sākumlapa: ⭐ TOP meistari sekcija (dzeltena, parādās ja ir featured)
- /api/cron/featured-expire — auto-deaktivācija + SMS meistariem
- vercel.json: dienas cron 02:00

## Nākamie uzdevumi (prioritāšu secībā)

### 🔴 Kritisks — drošība
- [ ] Twilio paraksta verifikācija webhook route (X-Twilio-Signature)

### 🔴 Kritisks — biznesa
- [ ] Stripe maksājumi — €19/mēn subscription (sākumlapa to sola bet nav)
- [ ] Pilns funnel tests no galvas līdz beigām (SS.lv → SMS → Jā → anketa → profils)

### 🟠 Augsta prioritāte — CRM
- [ ] CRM meklēšana pēc vārda/telefona/reģiona
- [ ] Ziņojumu vēsture (zinojumi) prospects detaļu lapā
- [ ] SMS/WA šabloni (saglabāti teksti, nav jāraksta katru reizi)
- [ ] CSV eksports no CRM

### 🟠 Augsta prioritāte — produkts
- [ ] SEO: meta tagi + schema.org/LocalBusiness meistaru lapām
- [ ] Klientu meklēšana pēc reģiona/specialitātes (MeklešanaForma backend)
- [ ] Atsauksmes: UI klientam atstāt, meistarim rādīt

### 🟡 Vidēja prioritāte
- [ ] Automatizēts follow-up (Vercel Cron) — ja 3d neatbild → auto SMS
- [ ] Reāllaika CRM atjauninājums kad nāk jauna atbilde
- [ ] Onboarding e-pasts pēc anketas apstiprināšanas
- [ ] Analytics (Vercel Analytics vai GA4)
- [ ] Google Kalendārs end-to-end tests + fix
