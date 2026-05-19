-- pakalpojumu_kategorijas
CREATE TABLE pakalpojumu_kategorijas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  darba_tips_id uuid REFERENCES darba_tipi(id) ON DELETE CASCADE,
  nosaukums text NOT NULL,
  kartiba integer DEFAULT 0
);

-- standartu_pakalpojumi
CREATE TABLE standartu_pakalpojumi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kategorija_id uuid REFERENCES pakalpojumu_kategorijas(id) ON DELETE CASCADE,
  nosaukums text NOT NULL,
  kartiba integer DEFAULT 0
);

-- RLS
ALTER TABLE pakalpojumu_kategorijas ENABLE ROW LEVEL SECURITY;
ALTER TABLE standartu_pakalpojumi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read pakalpojumu_kategorijas" ON pakalpojumu_kategorijas FOR SELECT USING (true);
CREATE POLICY "public read standartu_pakalpojumi" ON standartu_pakalpojumi FOR SELECT USING (true);

-- Seed: santehnika (slug = 'santehnika')
WITH
  dt AS (
    SELECT id FROM darba_tipi WHERE slug = 'santehnika'
  ),
  kat AS (
    INSERT INTO pakalpojumu_kategorijas (darba_tips_id, nosaukums, kartiba)
    SELECT dt.id, v.nosaukums, v.kartiba
    FROM dt,
    (VALUES
      ('Santehnikas darbi',      1),
      ('Cauruļvadi un sistēmas', 2),
      ('Kanalizācijas darbi',    3),
      ('Kanalizācijas izbūve',   4),
      ('Ūdensapgāde',            5),
      ('Papildus',               6)
    ) AS v(nosaukums, kartiba)
    RETURNING id, nosaukums
  )
INSERT INTO standartu_pakalpojumi (kategorija_id, nosaukums, kartiba)
SELECT kat.id, p.nosaukums, p.kartiba
FROM kat
JOIN (VALUES
  ('Santehnikas darbi', 'Avārijas situāciju novēršana',                  1),
  ('Santehnikas darbi', 'Noplūžu diagnostika un remonts',                2),
  ('Santehnikas darbi', 'Ūdens jaucējkrānu uzstādīšana un nomaiņa',     3),
  ('Santehnikas darbi', 'Sifonu montāža un demontāža',                   4),
  ('Santehnikas darbi', 'Izlietņu uzstādīšana',                          5),
  ('Santehnikas darbi', 'WC podu un bidē montāža/demontāža',             6),
  ('Santehnikas darbi', 'Veļas mašīnu pieslēgšana',                      7),
  ('Santehnikas darbi', 'Trauku mazgājamo mašīnu pieslēgšana',           8),
  ('Santehnikas darbi', 'Dvieļu žāvētāju uzstādīšana un maiņa',         9),
  ('Santehnikas darbi', 'Boileru uzstādīšana, apkope un maiņa',         10),
  ('Santehnikas darbi', 'Ūdens filtru uzstādīšana un nomaiņa',          11),
  ('Santehnikas darbi', 'Dušu kabīņu, vannu, džakuzi uzstādīšana',      12),
  ('Santehnikas darbi', 'Kanalizācijas sūkņu uzstādīšana',              13),
  ('Santehnikas darbi', 'Radiatoru uzstādīšana, maiņa un projektēšana', 14),
  ('Santehnikas darbi', 'WC mehānismu remonts un maiņa',                 15),

  ('Cauruļvadi un sistēmas', 'Ūdens un kanalizācijas cauruļu montāža/demontāža',       1),
  ('Cauruļvadi un sistēmas', 'Stāvvadu un guļvadu nomaiņa',                            2),
  ('Cauruļvadi un sistēmas', 'Iekšējo ūdens un kanalizācijas tīklu izbūve un remonts', 3),
  ('Cauruļvadi un sistēmas', 'Karstā un aukstā ūdens cauruļvadu ievilkšana',           4),
  ('Cauruļvadi un sistēmas', 'Kanalizācijas stāvvadu montāža un pārvietošana',         5),
  ('Cauruļvadi un sistēmas', 'Drenāžas sistēmu izbūve un remonts',                     6),
  ('Cauruļvadi un sistēmas', 'Apkures sistēmu montāža un remonts',                     7),

  ('Kanalizācijas darbi', 'Hidrodinamiskā cauruļvadu skalošana',              1),
  ('Kanalizācijas darbi', 'Aizsprostojumu likvidēšana',                       2),
  ('Kanalizācijas darbi', 'Iekšējo un ārējo kanalizācijas tīklu tīrīšana',   3),
  ('Kanalizācijas darbi', 'Lietus kanalizācijas skalošana',                   4),
  ('Kanalizācijas darbi', 'Profilaktiskā cauruļu tīrīšana',                   5),

  ('Kanalizācijas izbūve', 'Ārējo un iekšējo kanalizācijas sistēmu izbūve', 1),
  ('Kanalizācijas izbūve', 'Bioloģiskās attīrīšanas sistēmas',               2),
  ('Kanalizācijas izbūve', 'Septiķu sistēmas',                                3),
  ('Kanalizācijas izbūve', 'Grodu aku sistēmas un ieliktņi',                  4),
  ('Kanalizācijas izbūve', 'Kanalizācijas izvade no ēkas',                    5),
  ('Kanalizācijas izbūve', 'Dažāda tilpuma tvertņu uzstādīšana',             6),

  ('Ūdensapgāde', 'Urbumu aprīkošana',                        1),
  ('Ūdensapgāde', 'Aku un spicu aprīkošana',                  2),
  ('Ūdensapgāde', 'Sūkņu uzstādīšana, remonts un maiņa',     3),
  ('Ūdensapgāde', 'Ūdens pievades izbūve no avota uz māju',  4),

  ('Papildus', 'Objektu apsekošana un konsultācijas', 1),
  ('Papildus', 'Tāmes sastādīšana',                   2),
  ('Papildus', 'Materiālu piegāde',                   3),
  ('Papildus', 'Pilna servisa apkalpošana',            4)
) AS p(kat_nosaukums, nosaukums, kartiba)
ON kat.nosaukums = p.kat_nosaukums;
