-- Allow admins to delete any event
CREATE POLICY "Admins can delete any event"
ON public.events FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all events (including drafts)
CREATE POLICY "Admins can view all events"
ON public.events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));