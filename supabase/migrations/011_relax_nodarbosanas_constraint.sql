-- Noņem nodarbosanas ierobežojumu — atļauts jebkāds teksts vai NULL
-- (remontdarbi, custom, kombinācijas u.c.)
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_nodarbosanas_check;

-- Valoda: NULL atļauts (CSV imports var nezināt valodu)
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_valoda_check;
ALTER TABLE prospects ADD CONSTRAINT prospects_valoda_check
  CHECK (valoda IS NULL OR valoda IN ('lv', 'ru'));
