
-- Add video_urls and artist_fee_paid columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS video_urls text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS artist_fee_paid boolean NOT NULL DEFAULT false;

-- Create app_settings table for admin-configurable settings
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view settings" ON public.app_settings FOR SELECT TO public USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings" ON public.app_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default artist fee
INSERT INTO public.app_settings (key, value) VALUES ('artist_fee_amount', '1000');
