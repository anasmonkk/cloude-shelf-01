
-- Fix permissive RLS policy on payments INSERT
DROP POLICY "Create payments" ON public.payments;
CREATE POLICY "Create payments" ON public.payments 
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_id 
      AND (orders.customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'delivery'))
    )
  );
