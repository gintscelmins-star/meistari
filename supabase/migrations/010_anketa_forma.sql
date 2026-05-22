ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS foto_hero TEXT,
  ADD COLUMN IF NOT EXISTS foto_darbs_1 TEXT,
  ADD COLUMN IF NOT EXISTS foto_darbs_2 TEXT,
  ADD COLUMN IF NOT EXISTS foto_darbs_3 TEXT,
  ADD COLUMN IF NOT EXISTS foto_darbs_4 TEXT,
  ADD COLUMN IF NOT EXISTS foto_profils TEXT,
  ADD COLUMN IF NOT EXISTS apraksts TEXT,
  ADD COLUMN IF NOT EXISTS darba_laiki JSONB,
  ADD COLUMN IF NOT EXISTS pakalpojumi TEXT[],
  ADD COLUMN IF NOT EXISTS anketa_aizpildita BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS anketa_apstiprinata BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS anketa_unique_code TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_anketa_code ON prospects(anketa_unique_code);

INSERT INTO storage.buckets (id, name, public)
VALUES ('meistaru-foto', 'meistaru-foto', true)
ON CONFLICT DO NOTHING;
