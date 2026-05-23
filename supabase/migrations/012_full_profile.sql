-- 012_full_profile.sql: Pilnā meistara profila lauki + prospect_atsauksmes

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS pieredze_gadi INTEGER,
  ADD COLUMN IF NOT EXISTS sia_nosaukums TEXT,
  ADD COLUMN IF NOT EXISTS sia_reg TEXT,
  ADD COLUMN IF NOT EXISTS sertificets BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS avarijas_24_7 BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cena_no INTEGER,
  ADD COLUMN IF NOT EXISTS cena_lidz INTEGER,
  ADD COLUMN IF NOT EXISTS hero_virsraksts TEXT,
  ADD COLUMN IF NOT EXISTS hero_apaksteksts TEXT,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS kategorijas TEXT[],
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_lidz TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS publiskets BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS publiskets_datums TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pakalpojumi_detail JSONB;

-- Atsauksmes prospect profiliem (atšķirīga no meistari.atsauksmes)
CREATE TABLE IF NOT EXISTS prospect_atsauksmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  autors TEXT NOT NULL,
  teksts TEXT NOT NULL,
  vertejums INTEGER CHECK (vertejums >= 1 AND vertejums <= 5),
  datums TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospect_atsauksmes_prospect ON prospect_atsauksmes(prospect_id);
