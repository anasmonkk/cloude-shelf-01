-- Seed districts for Kerala
INSERT INTO public.districts (name, state_id) VALUES
  ('Thrissur', '6c770228-ed49-4d14-89ad-d6a1b589b3f5'),
  ('Ernakulam', '6c770228-ed49-4d14-89ad-d6a1b589b3f5'),
  ('Palakkad', '6c770228-ed49-4d14-89ad-d6a1b589b3f5');

-- Seed panchayaths (ward_count triggers auto ward creation)
INSERT INTO public.panchayaths (name, district_id, ward_count)
SELECT p.name, d.id, p.wc
FROM (VALUES
  ('Kuttanellur', 'Thrissur', 25),
  ('Ollur', 'Thrissur', 20),
  ('Nadathara', 'Thrissur', 18),
  ('Koorkenchery', 'Thrissur', 22),
  ('Ayyanthole', 'Thrissur', 19),
  ('Kakkanad', 'Ernakulam', 30),
  ('Thrikkakara', 'Ernakulam', 28),
  ('Palakkad Town', 'Palakkad', 35)
) AS p(name, dist, wc)
JOIN districts d ON d.name = p.dist;

-- Seed areas
INSERT INTO public.areas (name) VALUES
  ('Thrissur East'),
  ('Thrissur West'),
  ('Kochi Metro'),
  ('Palakkad Central');

-- Link panchayaths to areas
INSERT INTO public.area_panchayaths (area_id, panchayath_id)
SELECT a.id, p.id FROM areas a, panchayaths p
WHERE (a.name = 'Thrissur East' AND p.name IN ('Kuttanellur', 'Ollur', 'Nadathara', 'Koorkenchery'))
   OR (a.name = 'Thrissur West' AND p.name = 'Ayyanthole')
   OR (a.name = 'Kochi Metro' AND p.name IN ('Kakkanad', 'Thrikkakara'))
   OR (a.name = 'Palakkad Central' AND p.name = 'Palakkad Town');