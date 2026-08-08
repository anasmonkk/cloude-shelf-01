CREATE TABLE public.delivery_staff_wards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  panchayath_id uuid NOT NULL REFERENCES public.panchayaths(id) ON DELETE CASCADE,
  ward_id uuid NOT NULL REFERENCES public.wards(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, ward_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_staff_wards TO authenticated;
GRANT ALL ON public.delivery_staff_wards TO service_role;

ALTER TABLE public.delivery_staff_wards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View delivery staff wards"
ON public.delivery_staff_wards FOR SELECT TO authenticated
USING (staff_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins manage delivery staff wards"
ON public.delivery_staff_wards FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Delivery staff view open orders in their wards"
ON public.orders FOR SELECT TO authenticated
USING (
  delivery_staff_id IS NULL
  AND status = 'confirmed'
  AND EXISTS (
    SELECT 1 FROM public.delivery_staff_wards dsw
    WHERE dsw.staff_id = auth.uid() AND dsw.ward_id = orders.ward_id
  )
);