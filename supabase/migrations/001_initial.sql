-- darba_tipi
CREATE TABLE darba_tipi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nosaukums text NOT NULL,
  ikona text,
  slug text NOT NULL UNIQUE
);

-- regioni
CREATE TABLE regioni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nosaukums text NOT NULL,
  slug text NOT NULL UNIQUE
);

-- meistari
CREATE TABLE meistari (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vards text NOT NULL,
  uzvards text NOT NULL,
  specialitate text NOT NULL,
  telefons text NOT NULL,
  pilseta text,
  slug text NOT NULL UNIQUE,
  foto_url text,
  aktīvs boolean NOT NULL DEFAULT true,
  rating numeric(3,2) DEFAULT 0,
  pieredze_gadi integer DEFAULT 0,
  apraksts text
);

-- pakalpojumi
CREATE TABLE pakalpojumi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meistars_id uuid NOT NULL REFERENCES meistari(id) ON DELETE CASCADE,
  nosaukums text NOT NULL,
  cena_no numeric(10,2) NOT NULL,
  ilgums_h numeric(4,1)
);

-- meistars_darba_tipi
CREATE TABLE meistars_darba_tipi (
  meistars_id uuid NOT NULL REFERENCES meistari(id) ON DELETE CASCADE,
  darba_tips_id uuid NOT NULL REFERENCES darba_tipi(id) ON DELETE CASCADE,
  PRIMARY KEY (meistars_id, darba_tips_id)
);

-- meistars_regioni
CREATE TABLE meistars_regioni (
  meistars_id uuid NOT NULL REFERENCES meistari(id) ON DELETE CASCADE,
  regions_id uuid NOT NULL REFERENCES regioni(id) ON DELETE CASCADE,
  PRIMARY KEY (meistars_id, regions_id)
);

-- booking
CREATE TABLE booking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meistars_id uuid NOT NULL REFERENCES meistari(id) ON DELETE CASCADE,
  klients_vards text NOT NULL,
  klients_telefons text NOT NULL,
  pakalpojums text NOT NULL,
  datums date NOT NULL,
  laiks time NOT NULL,
  google_event_id text,
  statuss text NOT NULL DEFAULT 'jauns',
  izveidots_at timestamptz NOT NULL DEFAULT now()
);

-- atsauksmes
CREATE TABLE atsauksmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meistars_id uuid NOT NULL REFERENCES meistari(id) ON DELETE CASCADE,
  autors text NOT NULL,
  teksts text NOT NULL,
  vertejums integer NOT NULL CHECK (vertejums BETWEEN 1 AND 5),
  datums date NOT NULL DEFAULT current_date
);

-- kalendars_sync
CREATE TABLE kalendars_sync (
  meistars_id uuid PRIMARY KEY REFERENCES meistari(id) ON DELETE CASCADE,
  google_refresh_token text,
  google_calendar_id text,
  sync_aktīvs boolean NOT NULL DEFAULT false
);

-- RLS
ALTER TABLE darba_tipi ENABLE ROW LEVEL SECURITY;
ALTER TABLE regioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE meistari ENABLE ROW LEVEL SECURITY;
ALTER TABLE pakalpojumi ENABLE ROW LEVEL SECURITY;
ALTER TABLE meistars_darba_tipi ENABLE ROW LEVEL SECURITY;
ALTER TABLE meistars_regioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking ENABLE ROW LEVEL SECURITY;
ALTER TABLE atsauksmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kalendars_sync ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "public read darba_tipi" ON darba_tipi FOR SELECT USING (true);
CREATE POLICY "public read regioni" ON regioni FOR SELECT USING (true);
CREATE POLICY "public read meistari" ON meistari FOR SELECT USING (aktīvs = true);
CREATE POLICY "public read pakalpojumi" ON pakalpojumi FOR SELECT USING (true);
CREATE POLICY "public read meistars_darba_tipi" ON meistars_darba_tipi FOR SELECT USING (true);
CREATE POLICY "public read meistars_regioni" ON meistars_regioni FOR SELECT USING (true);
CREATE POLICY "public read atsauksmes" ON atsauksmes FOR SELECT USING (true);
CREATE POLICY "public insert booking" ON booking FOR INSERT WITH CHECK (true);

-- Seed: darba_tipi
INSERT INTO darba_tipi (nosaukums, ikona, slug) VALUES
  ('Santehnika', '🔧', 'santehnika'),
  ('Elektrika', '⚡', 'elektrika'),
  ('Remonts', '🏠', 'remonts');

-- Seed: regioni
INSERT INTO regioni (nosaukums, slug) VALUES
  ('Rīga', 'riga'),
  ('Jūrmala', 'jurmala'),
  ('Jelgava', 'jelgava'),
  ('Ogre', 'ogre'),
  ('Sigulda', 'sigulda');
