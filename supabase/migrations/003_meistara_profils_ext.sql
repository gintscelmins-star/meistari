-- meistara_pakalpojumi
CREATE TABLE meistara_pakalpojumi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meistars_id uuid NOT NULL REFERENCES meistari(id) ON DELETE CASCADE,
  standartu_pakalpojums_id uuid NOT NULL REFERENCES standartu_pakalpojumi(id) ON DELETE CASCADE,
  cena_no decimal(10,2),
  cena_lidz decimal(10,2),
  apraksts text,
  UNIQUE(meistars_id, standartu_pakalpojums_id)
);

-- meistara_foto
CREATE TABLE meistara_foto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meistars_id uuid NOT NULL REFERENCES meistari(id) ON DELETE CASCADE,
  url text NOT NULL,
  apraksts text,
  kartiba integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- darba_laiki
CREATE TABLE darba_laiki (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meistars_id uuid NOT NULL REFERENCES meistari(id) ON DELETE CASCADE,
  dienas_nr integer NOT NULL CHECK (dienas_nr BETWEEN 1 AND 7),
  no_laiks time NOT NULL DEFAULT '08:00',
  lidz_laiks time NOT NULL DEFAULT '18:00',
  strada boolean NOT NULL DEFAULT true,
  UNIQUE(meistars_id, dienas_nr)
);

-- RLS
ALTER TABLE meistara_pakalpojumi ENABLE ROW LEVEL SECURITY;
ALTER TABLE meistara_foto ENABLE ROW LEVEL SECURITY;
ALTER TABLE darba_laiki ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "public read meistara_pakalpojumi"
  ON meistara_pakalpojumi FOR SELECT USING (true);

CREATE POLICY "public read meistara_foto"
  ON meistara_foto FOR SELECT USING (true);

CREATE POLICY "public read darba_laiki"
  ON darba_laiki FOR SELECT USING (true);

-- Owner write
CREATE POLICY "owner all meistara_pakalpojumi"
  ON meistara_pakalpojumi FOR ALL
  USING (EXISTS (SELECT 1 FROM meistari WHERE id = meistara_pakalpojumi.meistars_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM meistari WHERE id = meistara_pakalpojumi.meistars_id AND user_id = auth.uid()));

CREATE POLICY "owner all meistara_foto"
  ON meistara_foto FOR ALL
  USING (EXISTS (SELECT 1 FROM meistari WHERE id = meistara_foto.meistars_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM meistari WHERE id = meistara_foto.meistars_id AND user_id = auth.uid()));

CREATE POLICY "owner all darba_laiki"
  ON darba_laiki FOR ALL
  USING (EXISTS (SELECT 1 FROM meistari WHERE id = darba_laiki.meistars_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM meistari WHERE id = darba_laiki.meistars_id AND user_id = auth.uid()));

-- Trigger: meistars.aktīvs = false when no working days
CREATE OR REPLACE FUNCTION check_meistars_aktivs()
RETURNS TRIGGER AS $$
DECLARE
  target_id uuid;
BEGIN
  target_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.meistars_id ELSE NEW.meistars_id END;
  UPDATE meistari
    SET aktīvs = EXISTS (
      SELECT 1 FROM darba_laiki
      WHERE meistars_id = target_id AND strada = true
    )
  WHERE id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER darba_laiki_aktivs_trigger
  AFTER INSERT OR UPDATE OR DELETE ON darba_laiki
  FOR EACH ROW EXECUTE FUNCTION check_meistars_aktivs();

-- Storage bucket for gallery photos
INSERT INTO storage.buckets (id, name, public)
  VALUES ('meistaru-foto', 'meistaru-foto', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read meistaru-foto"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meistaru-foto');

CREATE POLICY "owner upload meistaru-foto"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'meistaru-foto'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM meistari WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "owner delete meistaru-foto"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'meistaru-foto'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM meistari WHERE user_id = auth.uid()
    )
  );
