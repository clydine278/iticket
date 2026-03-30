CREATE OR REPLACE FUNCTION public.increment_sold(_ticket_type_id uuid, _qty integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE ticket_types
  SET sold = COALESCE(sold, 0) + _qty
  WHERE id = _ticket_type_id;
$$;