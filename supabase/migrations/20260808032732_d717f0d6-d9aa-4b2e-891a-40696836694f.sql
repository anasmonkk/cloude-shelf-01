CREATE POLICY "Delivery staff view own collections"
ON public.payments FOR SELECT TO authenticated
USING (collected_by = auth.uid());

CREATE POLICY "Delivery staff submit own collections"
ON public.payments FOR UPDATE TO authenticated
USING (collected_by = auth.uid())
WITH CHECK (collected_by = auth.uid());