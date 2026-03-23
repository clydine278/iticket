-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  username text UNIQUE,
  stage_name text,
  email text,
  phone text,
  city text,
  country text,
  avatar_url text,
  bio text,
  account_type text NOT NULL DEFAULT 'personal',
  booking_price text,
  services text[],
  social_links jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT TO anon USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, stage_name, email, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'stage_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'personal')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  venue text,
  city text,
  date timestamptz NOT NULL,
  end_date timestamptz,
  banner_url text,
  category text DEFAULT 'concert',
  status text DEFAULT 'draft',
  capacity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (status = 'published' OR (auth.uid() = organizer_id));
CREATE POLICY "Organizers can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own events" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete own events" ON public.events FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

-- Ticket types per event
CREATE TABLE public.ticket_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  sold integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view ticket types" ON public.ticket_types FOR SELECT USING (true);
CREATE POLICY "Event organizers can manage ticket types" ON public.ticket_types FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_types.event_id AND events.organizer_id = auth.uid())
);
CREATE POLICY "Event organizers can update ticket types" ON public.ticket_types FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_types.event_id AND events.organizer_id = auth.uid())
);
CREATE POLICY "Event organizers can delete ticket types" ON public.ticket_types FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_types.event_id AND events.organizer_id = auth.uid())
);

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  ticket_type_id uuid REFERENCES public.ticket_types(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  total_amount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  payment_method text,
  payment_reference text,
  qr_code text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Organizers can view event orders" ON public.orders FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.events WHERE events.id = orders.event_id AND events.organizer_id = auth.uid())
);

-- Bookings
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organizer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  event_name text,
  event_date timestamptz,
  venue text,
  message text,
  offered_price numeric,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artists can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = artist_id);
CREATE POLICY "Organizers can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Artists can update booking status" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = artist_id);

-- Challenges
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  rules text,
  prize text,
  song_title text,
  song_url text,
  banner_url text,
  start_date timestamptz,
  end_date timestamptz,
  status text DEFAULT 'active',
  participants_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Creators can insert challenges" ON public.challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update challenges" ON public.challenges FOR UPDATE TO authenticated USING (auth.uid() = creator_id);

-- Challenge entries
CREATE TABLE public.challenge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  video_url text,
  likes integer DEFAULT 0,
  views integer DEFAULT 0,
  rank integer,
  status text DEFAULT 'submitted',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view entries" ON public.challenge_entries FOR SELECT USING (true);
CREATE POLICY "Users can submit entries" ON public.challenge_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  description text,
  reference_id uuid,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User roles for admin
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;