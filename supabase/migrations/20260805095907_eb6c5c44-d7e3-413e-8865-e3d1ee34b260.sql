ALTER TABLE public.vendor_applications ADD COLUMN IF NOT EXISTS requested_role public.app_role NOT NULL DEFAULT 'owner';
UPDATE public.vendor_applications SET requested_role = 'owner' WHERE requested_role IS NULL;
CREATE INDEX IF NOT EXISTS vendor_applications_requested_role_idx ON public.vendor_applications (requested_role, status);