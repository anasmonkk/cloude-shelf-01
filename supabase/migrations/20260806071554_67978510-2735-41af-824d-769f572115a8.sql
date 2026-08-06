-- Public (anon) read access for browsing
GRANT SELECT ON public.items TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.delivery_config TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_config TO authenticated;
GRANT ALL ON public.delivery_config TO service_role;

CREATE POLICY "Anon can view active items"
ON public.items FOR SELECT TO anon
USING (status = 'active'::item_status);

CREATE POLICY "Anon can view categories"
ON public.categories FOR SELECT TO anon
USING (true);

CREATE POLICY "Anon can view delivery config"
ON public.delivery_config FOR SELECT TO anon
USING (true);

-- Ensure standard grants exist for every other public table
DO $$
DECLARE
    tbl record;
    has_priv boolean;
BEGIN
    FOR tbl IN
        SELECT c.relname AS table_name
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE c.relkind = 'r' AND n.nspname = 'public'
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.role_table_grants
             WHERE grantee = 'authenticated' AND table_schema = 'public' AND table_name = tbl.table_name
               AND privilege_type IN ('SELECT','INSERT','UPDATE','DELETE')
        ) INTO has_priv;
        IF NOT has_priv THEN
            EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl.table_name);
        END IF;

        SELECT EXISTS (
            SELECT 1 FROM information_schema.role_table_grants
             WHERE grantee = 'service_role' AND table_schema = 'public' AND table_name = tbl.table_name
               AND privilege_type IN ('SELECT','INSERT','UPDATE','DELETE')
        ) INTO has_priv;
        IF NOT has_priv THEN
            EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl.table_name);
        END IF;
    END LOOP;
END;
$$;