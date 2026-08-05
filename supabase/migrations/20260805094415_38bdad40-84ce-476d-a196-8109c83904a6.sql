CREATE TABLE public.vendor_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  mobile text NOT NULL,
  panchayath_id uuid REFERENCES public.panchayaths(id),
  ward_id uuid REFERENCES public.wards(id),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_applications TO authenticated;
GRANT ALL ON public.vendor_applications TO service_role;

ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create own vendor application"
ON public.vendor_applications FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "View own or admin vendor applications"
ON public.vendor_applications FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins update vendor applications"
ON public.vendor_applications FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins delete vendor applications"
ON public.vendor_applications FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
