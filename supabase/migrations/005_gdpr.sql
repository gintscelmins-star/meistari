-- Pievieno GDPR kolonnas prospects tabulai
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS
  gdpr_piekrits BOOLEAN DEFAULT false;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS
  gdpr_datums TIMESTAMPTZ;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS
  dzesanas_pieprasits BOOLEAN DEFAULT false;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS
  dzesanas_datums TIMESTAMPTZ;

-- Datu anonimizācijas funkcija
CREATE OR REPLACE FUNCTION anonimizet_prospect(p_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE prospects SET
    vards = 'DZĒSTS',
    uzvards = 'DZĒSTS',
    telefons = 'DZĒSTS',
    ss_url = NULL,
    piezimes = NULL,
    dzesanas_pieprasits = true,
    dzesanas_datums = NOW()
  WHERE id = p_id;

  DELETE FROM zinojumi WHERE prospect_id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-dzēšana pēc 2 gadiem
CREATE OR REPLACE FUNCTION auto_gdpr_cleanup()
RETURNS void AS $$
BEGIN
  PERFORM anonimizet_prospect(id)
  FROM prospects
  WHERE updated_at < NOW() - INTERVAL '2 years'
  AND dzesanas_pieprasits = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
