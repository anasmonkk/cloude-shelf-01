
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS delivery_address text,
  ADD COLUMN IF NOT EXISTS panchayath_id uuid REFERENCES public.panchayaths(id),
  ADD COLUMN IF NOT EXISTS ward_id uuid REFERENCES public.wards(id);
