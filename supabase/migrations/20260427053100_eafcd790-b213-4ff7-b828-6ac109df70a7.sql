-- Allow creators to delete their own challenges, and admins to delete any challenge
CREATE POLICY "Creators can delete own challenges"
ON public.challenges
FOR DELETE
TO authenticated
USING (auth.uid() = creator_id);

CREATE POLICY "Admins can delete any challenge"
ON public.challenges
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also allow cascading cleanup of related challenge_entries
CREATE POLICY "Creators can delete entries of own challenges"
ON public.challenge_entries
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.challenges c
    WHERE c.id = challenge_entries.challenge_id
      AND c.creator_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete any challenge entry"
ON public.challenge_entries
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));