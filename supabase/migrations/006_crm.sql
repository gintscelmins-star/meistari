-- 006_crm.sql: CRM lauki prospects un zinojumi tabulām

-- Prospects: CRM lauki
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS valoda TEXT NOT NULL DEFAULT 'lv',
  ADD COLUMN IF NOT EXISTS statuss TEXT NOT NULL DEFAULT 'jauns',
  ADD COLUMN IF NOT EXISTS regions TEXT,
  ADD COLUMN IF NOT EXISTS demo_slug TEXT,
  ADD COLUMN IF NOT EXISTS demo_url TEXT,
  ADD COLUMN IF NOT EXISTS maksatajs BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS plans TEXT,
  ADD COLUMN IF NOT EXISTS trial_sakums TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_beigas TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pedeja_kontakts TIMESTAMPTZ;

ALTER TABLE prospects
  ADD CONSTRAINT prospects_valoda_check CHECK (valoda IN ('lv', 'ru')),
  ADD CONSTRAINT prospects_statuss_check CHECK (statuss IN ('jauns', 'nosutits', 'atbildeja', 'demo_nosutits', 'maksatajs', 'atteicas')),
  ADD CONSTRAINT prospects_plans_check CHECK (plans IS NULL OR plans IN ('trial', 'basic', 'pro'));

-- Zinojumi: kanāls, virziens, statuss
ALTER TABLE zinojumi
  ADD COLUMN IF NOT EXISTS kanals TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS virziens TEXT NOT NULL DEFAULT 'out',
  ADD COLUMN IF NOT EXISTS statuss TEXT NOT NULL DEFAULT 'nosutits';

ALTER TABLE zinojumi
  ADD CONSTRAINT zinojumi_kanals_check CHECK (kanals IN ('sms', 'whatsapp', 'manual')),
  ADD CONSTRAINT zinojumi_virziens_check CHECK (virziens IN ('out', 'in')),
  ADD CONSTRAINT zinojumi_statuss_check CHECK (statuss IN ('nosutits', 'piegadats', 'lasits', 'klude'));

-- Indeksi ātrākiem vaicājumiem
CREATE INDEX IF NOT EXISTS prospects_statuss_idx ON prospects(statuss);
CREATE INDEX IF NOT EXISTS prospects_created_at_idx ON prospects(created_at DESC);
CREATE INDEX IF NOT EXISTS zinojumi_prospect_id_idx ON zinojumi(prospect_id);
CREATE INDEX IF NOT EXISTS zinojumi_izveidots_at_idx ON zinojumi(izveidots_at DESC);
