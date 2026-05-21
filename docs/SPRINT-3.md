# Sprint 3 — CRM Pamats

**Datums:** 2026-05-21  
**Branch:** sprint/3-crm-pamats

## Uzdevumi

- [x] `supabase/migrations/006_crm.sql` — CRM lauki prospects un zinojumi tabulām
- [x] `lib/database.types.ts` — pilns prospects un zinojumi tipu apraksts
- [x] `app/crm/(protected)/layout.tsx` — auth aizsardzība + navigācija
- [x] `app/crm/login/page.tsx` — pierakstīšanās forma
- [x] `app/crm/(protected)/page.tsx` — prospects tabula ar statistiku un filtriem
- [x] `app/crm/(protected)/prospects/new/page.tsx` — jauna prospect forma + CSV imports
- [x] `app/api/crm/prospects/route.ts` — GET (saraksts + statistika) + POST (viens/batch)
- [x] `app/api/crm/prospects/[id]/route.ts` — PATCH (statuss/piezimes) + DELETE (GDPR anonimizācija)

## Struktūra

```
app/crm/
  login/page.tsx              ← publiski pieejama, bez auth
  (protected)/
    layout.tsx                ← auth pārbaude, nav sidebar
    page.tsx                  ← galvenā CRM tabula
    prospects/new/page.tsx    ← jauna prospect + CSV

app/api/crm/prospects/
  route.ts                    ← GET /api/crm/prospects, POST
  [id]/route.ts               ← PATCH, DELETE
```

## Statuss vērtības

| Vērtība       | Nozīme                          |
|---------------|---------------------------------|
| jauns         | Tikko pievienots                |
| nosutits      | SMS/WA nosūtīts                 |
| atbildeja     | Klients atbildēja               |
| demo_nosutits | Demo lapa nosūtīta              |
| maksatajs     | Aktīvs maksātājs                |
| atteicas      | Atteicās vai nav intereses      |

## API

### GET /api/crm/prospects
Query: `page`, `pageSize` (max 100), `statuss` (opcija)  
Response: `{ prospects[], total, stats }`

### POST /api/crm/prospects
Body: viens objekts vai masīvs (CSV imports)  
Obligātie lauki: `vards`, `uzvards`, `telefons`

### PATCH /api/crm/prospects/:id
Body: `{ statuss?, piezimes?, demo_url?, demo_slug? }`

### DELETE /api/crm/prospects/:id
GDPR anonimizācija — nomaina datus ar "DZĒSTS", dzēš ziņojumus.

## Drošība

- Visi `/api/crm/*` maršruti pārbauda `auth.getUser()` → 401 ja nav
- Rate limiting: max 100 req/min
- DELETE neizdzēš ierakstu — GDPR-saderīga anonimizācija
- Statuss validācija ar `VALID_STATUSI` sarakstu
- Array body: filtrē tukšos ierakstus pirms insert

## Nākamie sprinti

- Sprint 4: SMS/WhatsApp sūtīšana (Twilio)
- Sprint 5: "Jā" workflow — demo nosūtīšana, piekrišanas tracking
- Sprint 6: Follow-up automātika + Ads integrācija
