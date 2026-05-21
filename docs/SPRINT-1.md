# Sprint 1 — DevOps + Domēns + GDPR

## Statuss: ✅ Pabeigts

## Izmaiņas

- Git branch stratēģija: main/develop/sprint/*
- CLAUDE.md atjaunināts ar DevOps standartiem, GDPR un drošības prasībām
- GDPR: `supabase/migrations/005_gdpr.sql` — prospects tabula + anonimizācija + auto-cleanup
- Privacy policy lapa: `/privacy` (LV + RU)
- GDPR erase API: `POST /api/gdpr/erase`
- GDPR cleanup cron endpoint: `GET /api/gdpr/cleanup`
- Rate limiting middleware: `lib/rate-limit.ts`
- Rate limiting pievienots visām API routes: booking, register, calendar/event, calendar/freebusy, gdpr/erase
- Security headers: `vercel.json` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Cron jobs: followup (katru dienu 8:00) + GDPR cleanup (reizi mēnesī)

## Faili

| Fails | Darbība |
|-------|---------|
| `CLAUDE.md` | Atjaunināts ar DevOps/GDPR/drošības standartiem |
| `supabase/migrations/005_gdpr.sql` | GDPR kolonnas + anonimizācijas funkcijas |
| `app/privacy/page.tsx` | Privacy policy LV + RU |
| `app/api/gdpr/erase/route.ts` | Datu dzēšanas API (10 req/h) |
| `app/api/gdpr/cleanup/route.ts` | Auto-cleanup cron endpoint |
| `lib/rate-limit.ts` | Rate limiting middleware |
| `vercel.json` | Security headers + cron jobs |

## Testēšana

- [x] `npm run build` → bez kļūdām
- [ ] Privacy lapa pieejama `/privacy`
- [ ] Rate limit atgriež 429 pēc limita
- [ ] GDPR erase API dzēš datus

## Nākamais: Sprint 2 — Demo kartīte
