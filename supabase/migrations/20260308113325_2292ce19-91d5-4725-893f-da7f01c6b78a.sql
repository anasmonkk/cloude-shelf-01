
-- Drop restrictive public read policies and recreate as permissive
DROP POLICY IF EXISTS "Public read states" ON public.states;
CREATE POLICY "Public read states" ON public.states FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read districts" ON public.districts;
CREATE POLICY "Public read districts" ON public.districts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read panchayaths" ON public.panchayaths;
CREATE POLICY "Public read panchayaths" ON public.panchayaths FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read wards" ON public.wards;
CREATE POLICY "Public read wards" ON public.wards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read areas" ON public.areas;
CREATE POLICY "Public read areas" ON public.areas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read area_panchayaths" ON public.area_panchayaths;
CREATE POLICY "Public read area_panchayaths" ON public.area_panchayaths FOR SELECT USING (true);
