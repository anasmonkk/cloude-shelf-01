ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'delivery_booked' AFTER 'confirmed';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'picked_up' AFTER 'delivery_booked';
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'submitted';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS booked_at timestamptz,
  ADD COLUMN IF NOT EXISTS picked_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS collected_at timestamptz,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz;