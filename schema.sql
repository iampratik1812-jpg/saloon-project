-- ==============================================================================
-- SalonBook — PostgreSQL / Supabase Schema & Migration
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'salon_owner', 'admin')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Salons Table
CREATE TABLE IF NOT EXISTS salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('unisex', 'barber', 'beauty_parlour', 'hair_studio')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  locality TEXT NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '21:00',
  opening_hours TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')),
  auto_confirm BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  starting_price NUMERIC(10, 2) DEFAULT 0,
  image_url TEXT,
  cancellation_policy TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_salons_city_locality ON salons(city, locality);
CREATE INDEX IF NOT EXISTS idx_salons_verification ON salons(verification_status);
CREATE INDEX IF NOT EXISTS idx_salons_category ON salons(category);

-- 3. Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id, is_active);

-- 4. Staff Table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_salon ON staff(salon_id, is_active);

-- 5. Staff Schedules Table
CREATE TABLE IF NOT EXISTS staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL DEFAULT '10:00',
  end_time TIME NOT NULL DEFAULT '20:00',
  break_start TIME DEFAULT '13:30',
  break_end TIME DEFAULT '14:30',
  is_working BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(staff_id, day_of_week)
);

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  cancel_reason TEXT,
  total_price NUMERIC(10, 2) NOT NULL,
  total_duration_minutes INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pay_at_salon', 'online')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  is_walkin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_salon_date ON bookings(salon_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_date ON bookings(staff_id, date, status);

-- 7. Booking Services (Historical Snapshot)
CREATE TABLE IF NOT EXISTS booking_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name_snapshot TEXT NOT NULL,
  price_snapshot NUMERIC(10, 2) NOT NULL,
  duration_snapshot INTEGER NOT NULL
);

-- 8. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  salon_response TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_salon ON reviews(salon_id);

-- 9. Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Customers can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Public can view approved salons
CREATE POLICY "Public can view approved salons" ON salons
  FOR SELECT USING (verification_status = 'approved');

-- Owners can view & manage their own salons
CREATE POLICY "Owners can manage own salons" ON salons
  FOR ALL USING (auth.uid() = owner_id);

-- Customers can view their own bookings
CREATE POLICY "Customers view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = customer_id);

-- Salon owners view their salon bookings
CREATE POLICY "Owners view salon bookings" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM salons WHERE salons.id = bookings.salon_id AND salons.owner_id = auth.uid())
  );
