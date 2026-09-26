-- ========================================================================
-- ExploreTN — Production-Grade Tamil Nadu Places Schema & Security Rules
-- Target Project: ajxnljrhueiiuwavbrra (https://ajxnljrhueiiuwavbrra.supabase.co)
-- ========================================================================

-- Enable PostGIS / UUID extensions if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing constraints if re-applying migration
DROP TABLE IF EXISTS public.places CASCADE;

-- 1. PRODUCTION PLACES TABLE
CREATE TABLE public.places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tamil_name TEXT,
  tagline TEXT,
  tamil_tagline TEXT,
  district TEXT NOT NULL,
  taluk TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'Temple', 'Heritage', 'Food Spot', 'Thrift Street', 
    'Waterfall', 'Hill Station', 'Beach', 'Wildlife', 'Culture', 'Craft'
  )),
  subcategories TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  tamil_description TEXT,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  address TEXT,
  pincode TEXT,
  opening_hours TEXT DEFAULT '6:00 AM - 9:00 PM',
  best_time_to_visit TEXT DEFAULT 'October to March',
  entry_fee_inr NUMERIC(8, 2) DEFAULT 0.00,
  entry_fee_info TEXT DEFAULT 'Free Entry',
  rating NUMERIC(3, 2) DEFAULT 4.80 CHECK (rating >= 0 AND rating <= 5.0),
  review_count INT DEFAULT 1,
  image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT TRUE,
  
  -- PRIVACY & ACCESS CONTROL FIELDS
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private', 'restricted')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'pending_review', 'archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. HIGH-PERFORMANCE INDEXES FOR SPATIAL & CATEGORY FETCHING
CREATE INDEX idx_places_district ON public.places(district);
CREATE INDEX idx_places_category ON public.places(category);
CREATE INDEX idx_places_slug ON public.places(slug);
CREATE INDEX idx_places_status_visibility ON public.places(status, visibility);
CREATE INDEX idx_places_lat_lng ON public.places(latitude, longitude);

-- 3. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_places_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_places_timestamp
BEFORE UPDATE ON public.places
FOR EACH ROW EXECUTE FUNCTION update_places_timestamp();

-- 4. ROW LEVEL SECURITY (RLS) & PRIVACY POLICIES
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public Read Access (Anyone can fetch published + public places)
CREATE POLICY "Public Read Access for Published Places" 
ON public.places FOR SELECT 
USING (
  status = 'published' AND visibility = 'public'
);

-- Policy 2: Content Creator Access (Creators can view/edit their own places regardless of status)
CREATE POLICY "Creator Full Access for Own Places" 
ON public.places FOR ALL 
USING (
  auth.uid() IS NOT NULL AND created_by = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL AND created_by = auth.uid()
);

-- Policy 3: Platform Super Admins & Managers Full Access
CREATE POLICY "Admin & Manager Full Access" 
ON public.places FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('super_admin', 'admin', 'place_manager', 'content_editor')
  )
);

-- 5. SECURE PRIVACY VIEW (Omits sensitive internal fields for public APIs)
CREATE OR REPLACE VIEW public.v_public_places AS
SELECT 
  id,
  slug,
  name,
  tamil_name,
  tagline,
  tamil_tagline,
  district,
  taluk,
  category,
  subcategories,
  description,
  tamil_description,
  latitude,
  longitude,
  address,
  pincode,
  opening_hours,
  best_time_to_visit,
  entry_fee_inr,
  entry_fee_info,
  rating,
  review_count,
  image_url,
  gallery_urls,
  tags,
  is_featured,
  is_verified,
  created_at
FROM public.places
WHERE status = 'published' AND visibility = 'public';
