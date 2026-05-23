# Sprint 6A — CRM Pilnā Meistara Kartīte

## Statuss: ✅ Pabeigts

## Izmaiņas

### DB
- `supabase/migrations/012_full_profile.sql` — 17 jauni lauki `prospects` tabulā + `prospect_atsauksmes` tabula

**Jaunie lauki prospects:**
- `pieredze_gadi`, `sia_nosaukums`, `sia_reg`, `sertificets`, `avarijas_24_7`
- `cena_no`, `cena_lidz`
- `hero_virsraksts`, `hero_apaksteksts`
- `meta_title`, `meta_description`
- `kategorijas TEXT[]`
- `featured`, `featured_lidz`, `publiskets`, `publiskets_datums`
- `pakalpojumi_detail JSONB` — rich pakalpojumi (ar ikonu, aprakstu, items)

**`prospect_atsauksmes` tabula:**
- `prospect_id`, `autors`, `teksts`, `vertejums` (1-5), `datums` (brīvteksts)

### API

| Route | Metode | Apraksts |
|-------|--------|----------|
| `/api/crm/meistari/[id]` | GET | Ielādē prospect + atsauksmes |
| `/api/crm/meistari/[id]` | PATCH | Saglabā visus laukus + atsauksmes (batch replace) |
| `/api/crm/meistari/[id]/foto` | POST | Upload foto uz Supabase Storage `meistaru-foto` bucket |
| `/api/crm/meistari/[id]/foto` | DELETE | Notīra foto URL no DB |

### Lapas

| Lapa | Ceļš |
|------|------|
| Pilnais redaktors | `/crm/meistari/[id]/edit` |
| Priekšskatījums | `/crm/meistari/[id]/preview` |
| Jauns meistars | `/crm/meistari/new` |

### Forma — 13 sadaļas
1. **Pamata info** — vārds, uzvārds, telefons, email, WhatsApp, valoda
2. **Kategorijas** — multi-select (Santehniķis, Elektriķis, u.c.) + galvenā specialitāte
3. **Atrašanās vieta** — pilsētas + Rīgas rajoni
4. **Darba laiks** — 7 dienas ar laika ievadi + avārijas 24/7 toggle
5. **Pieredze** — gadi, sertifikāts, SIA info
6. **Cenas** — no/līdz
7. **Hero** — virsraksts + apakšteksts
8. **Foto** — 6 sloti ar upload/delete/preview
9. **Apraksts** — textarea, max 3000 simboli
10. **Pakalpojumi** — dynamic list (nosaukums, ikona, apraksts, cenas, items saraksts)
11. **Atsauksmes** — dynamic list (autors, teksts, zvaigznes 1-5, datums)
12. **SEO** — meta_title + meta_description (auto-ģenerēts)
13. **Publicēšana** — slug, featured, publiskets statuss

### Auto-ģenerācija
- `demo_slug` ← slugify(vārds + uzvārds) — auto kad tukšs
- `meta_title` ← "{Vārds} {Uzvārds} | {specialitāte} {pirmā pilsēta}" — auto
- `meta_description` ← apraksta pirmie 155 simboli — auto

### CRM galvenā lapa izmaiņas
- `[+ Pievienot meistaru]` poga → `/crm/meistari/new` (zaļa)
- `[+ Jauns prospect]` poga → `/crm/prospects/new` (zila)
- `🪪` poga katrā rindā → `/crm/meistari/[id]/edit` (pilnais redaktors)

## Testēšana

- [ ] CRM → `[+ Pievienot meistaru]` → aizpilda vārds/uzvārds/telefons → izveido
- [ ] Tiek atvērts pilnais redaktors `/crm/meistari/[id]/edit`
- [ ] Visas 13 sadaļas redzamas un funkcionē
- [ ] Foto upload darbojas → attēls parādās preview
- [ ] `[Saglabāt melnrakstu]` → parādās "Saglabāts!"
- [ ] `[Saglabāt un priekšskatīt]` → atveras preview ar dzelteno banneri
- [ ] Pakalpojumu pievienošana/dzēšana darbojas
- [ ] Atsauksmju pievienošana ar zvaigzņu vērtējumu darbojas
- [ ] Slug auto-ģenerējas no vārda un uzvārda
- [ ] CRM galvenajā lapā redzama `🪪` poga

## Nākamais: Sprint 6B — AI apraksts
