ALTER TABLE public.orders 
ADD COLUMN ticket_code TEXT UNIQUE,
ADD COLUMN used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Allow moderators and admins to update orders (for marking tickets as used)
CREATE POLICY "Moderators can view orders for verification"
ON public.orders FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)
);

CREATE POLICY "Moderators can update orders for verification"
ON public.orders FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)
);