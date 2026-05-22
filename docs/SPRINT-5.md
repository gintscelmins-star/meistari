# Sprint 5 — Jā Workflow + Anketa Forma

## Statuss: ✅ Pabeigts

## Plūsma

```
SMS "OK/Jā" → webhook ģenerē UUID → SMS ar anketa URL
→ /anketa/{code} forma → 6 foto upload → submit
→ CRM "Gaida apstiprināšanu" → [Apstiprināt]
→ /meistari/{slug} lapa live + SMS meistarim
```

## Izmaiņas

### DB migrācijas
- `009_prospect_lapa_izveidota.sql` — lapa_izveidota boolean
- `010_anketa_forma.sql` — email, foto_*, apraksts, darba_laiki JSONB, pakalpojumi TEXT[], anketa_aizpildita, anketa_apstiprinata, anketa_unique_code
- Supabase Storage bucket: `meistaru-foto` (public)

### API routes
| Route | Metode | Apraksts |
|-------|--------|----------|
| `/api/crm/webhook` | POST | Jā → ģenerē anketa UUID, sūta SMS link |
| `/api/anketa/prospect` | GET | Iegūst prospect pēc anketa_code |
| `/api/anketa/upload-foto` | POST | Foto → Supabase Storage, atjaunina DB |
| `/api/anketa/submit` | POST | Saglabā anketu, statuss → gaida_apstiprinasanu |
| `/api/crm/approve-meistars/[id]` | POST | Publicē: demo_url, trial, SMS |

### Lapas
- `/anketa/[code]` — mobil-first forma ar 6 foto upload + darba laiki
- `/meistari/[slug]` — prospects anketa_apstiprinata → MeistaraLapa
- `/crm/prospects/[id]` — anketa review + apstiprināšanas UI

### Statusi (pilna virkne)
jauns → nosutits → atbildeja → anketa_nosutita → gaida_apstiprinasanu → maksatajs

## Testēšana

- [ ] Twilio webhook: SMS "OK" → saņem anketas linku
- [ ] /anketa/{code} — forma ielādējas ar vārdu no DB
- [ ] Foto upload — parādās preview, "✓ Augšupielādēts"
- [ ] Submit — statuss mainās uz "gaida_apstiprinasanu"
- [ ] CRM → prospect detail → rāda "Anketa aizpildīta" sekciju ar fotiem
- [ ] [Apstiprināt un publicēt] → lapa live, SMS meistarim
- [ ] /meistari/{slug} → rāda MeistaraLapa ar reālajiem datiem

## Nākamais: Sprint 6 — Follow-up + Ads

- Trial beigu atgādinājumu SMS (automātisks, 14d pēc trial_sakums)
- Maksājumu integrācija (Stripe)
- Follow-up secība neatbildējušiem prospects
