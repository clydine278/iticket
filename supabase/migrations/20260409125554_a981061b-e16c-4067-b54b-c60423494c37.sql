
-- Add bank account fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_name text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account_name text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account_number text DEFAULT NULL;

-- Add payment tracking to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_reference text DEFAULT NULL;

-- Add rejection message to challenge entries
ALTER TABLE public.challenge_entries ADD COLUMN IF NOT EXISTS rejection_message text DEFAULT NULL;
