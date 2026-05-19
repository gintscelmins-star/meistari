-- user_id column on meistari (links to auth.users)
ALTER TABLE meistari ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Owner: update own meistari profile
CREATE POLICY IF NOT EXISTS "owner update meistari"
  ON meistari FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Owner: meistars reads own booking list
CREATE POLICY IF NOT EXISTS "owner read booking"
  ON booking FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM meistari WHERE id = booking.meistars_id AND user_id = auth.uid()
  ));

-- Owner: meistars updates booking status
CREATE POLICY IF NOT EXISTS "owner update booking"
  ON booking FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM meistari WHERE id = booking.meistars_id AND user_id = auth.uid()
  ));

-- Owner: full access to own kalendars_sync
CREATE POLICY IF NOT EXISTS "owner all kalendars_sync"
  ON kalendars_sync FOR ALL
  USING (EXISTS (
    SELECT 1 FROM meistari WHERE id = kalendars_sync.meistars_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM meistari WHERE id = kalendars_sync.meistars_id AND user_id = auth.uid()
  ));

-- Storage: avatars bucket (profile photos)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "owner upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM meistari WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "owner update avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM meistari WHERE user_id = auth.uid()
    )
  );
