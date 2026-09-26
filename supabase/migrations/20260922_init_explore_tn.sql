-- ========================================================
-- ExploreTN — Primary Supabase Database Schema Migration
-- Target Project: ajxnljrhueiiuwavbrra (https://ajxnljrhueiiuwavbrra.supabase.co)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'explorer' CHECK (role IN ('explorer', 'place_manager', 'route_manager', 'community_manager', 'content_editor', 'super_admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  rank TEXT NOT NULL DEFAULT 'Verified Explorer',
  district_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DISTRICTS TABLE
CREATE TABLE IF NOT EXISTS public.districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  tamil_name TEXT NOT NULL,
  region TEXT NOT NULL, -- North, South, Central, Western Ghats, Coastal
  headquarters TEXT NOT NULL,
  description TEXT,
  hero_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PLACES / DESTINATIONS TABLE
CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tamil_name TEXT,
  district TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Temple', 'Heritage', 'Food Spot', 'Thrift Street', 'Waterfall', 'Hill Station', 'Beach', 'Wildlife', 'Culture')),
  description TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  address TEXT,
  opening_hours TEXT DEFAULT '6:00 AM - 9:00 PM',
  entry_fee TEXT DEFAULT 'Free',
  rating NUMERIC(3, 2) DEFAULT 4.80,
  image_url TEXT,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ROUTES TABLE (Ghat Passes, Scenic Drives & Heritage Trails)
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  tamil_title TEXT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_km NUMERIC(6, 2) NOT NULL,
  duration TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'moderate', 'challenging', 'extreme')),
  waypoints JSONB NOT NULL DEFAULT '[]'::jsonb,
  district TEXT NOT NULL,
  elevation_gain_m INT,
  hairpin_bends INT DEFAULT 0,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. HOTELS / RESORTS TABLE
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  price_range TEXT NOT NULL,
  rating NUMERIC(3, 2) DEFAULT 4.5,
  amenities TEXT[] DEFAULT ARRAY['WiFi', 'Parking', 'Restaurant'],
  image_url TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. RESTAURANTS / STREET FOOD STALLS TABLE
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  cuisine TEXT NOT NULL DEFAULT 'South Indian & Traditional Tamil',
  is_vegetarian BOOLEAN DEFAULT FALSE,
  price_range TEXT DEFAULT '₹150 - ₹500',
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  opening_hours TEXT DEFAULT '7:00 AM - 11:00 PM',
  image_url TEXT,
  rating NUMERIC(3, 2) DEFAULT 4.7,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. EVENTS & CULTURAL FESTIVALS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  district TEXT NOT NULL,
  venue TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Cultural Festival',
  ticket_price TEXT DEFAULT 'Free Entry',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ultra-fast spatial and district queries
CREATE INDEX IF NOT EXISTS idx_places_district ON public.places(district);
CREATE INDEX IF NOT EXISTS idx_places_category ON public.places(category);
CREATE INDEX IF NOT EXISTS idx_places_status ON public.places(status);
CREATE INDEX IF NOT EXISTS idx_routes_district ON public.routes(district);
CREATE INDEX IF NOT EXISTS idx_hotels_district ON public.hotels(district);
CREATE INDEX IF NOT EXISTS idx_restaurants_district ON public.restaurants(district);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Allow anyone to view published places, routes, hotels, restaurants, events)
CREATE POLICY "Public read access for published places" ON public.places FOR SELECT USING (status = 'published');
CREATE POLICY "Public read access for active routes" ON public.routes FOR SELECT USING (status = 'active');
CREATE POLICY "Public read access for hotels" ON public.hotels FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access for restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Public read access for events" ON public.events FOR SELECT USING (true);
