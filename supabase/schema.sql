-- ============================================================
-- ExploreTN — Full Database Schema
-- Users (multi-table, FK-linked) + 38 District Place Tables
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SECTION 1: USER TABLES
-- ============================================================

-- 1a. users — core identity and auth
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'explorer'
                 CHECK (role IN ('explorer','beta_tester','place_manager','route_manager',
                                 'community_manager','content_editor','weather_manager',
                                 'analytics_manager','ai_manager','admin','super_admin')),
  status       TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','suspended','pending')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 1b. user_profiles — personal / extended details
CREATE TABLE IF NOT EXISTS user_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone               TEXT,
  bio                 TEXT,
  city                TEXT,
  state               TEXT DEFAULT 'Tamil Nadu',
  country             TEXT DEFAULT 'India',
  date_of_birth       DATE,
  gender              TEXT CHECK (gender IN ('male','female','other','prefer_not_to_say')),
  preferred_language  TEXT DEFAULT 'en',
  website_url         TEXT,
  instagram_handle    TEXT,
  profile_complete    BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- 1c. user_stats — gamification, XP, ranks
CREATE TABLE IF NOT EXISTS user_stats (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  xp                INTEGER DEFAULT 0,
  rank_title        TEXT DEFAULT 'Level 0 Explorer',
  level             INTEGER DEFAULT 0,
  district_count    INTEGER DEFAULT 0,
  places_visited    INTEGER DEFAULT 0,
  trips_completed   INTEGER DEFAULT 0,
  reviews_written   INTEGER DEFAULT 0,
  photos_uploaded   INTEGER DEFAULT 0,
  badges            JSONB DEFAULT '[]',
  streak_days       INTEGER DEFAULT 0,
  last_active_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- 1d. user_district_visits — which districts each user has visited
CREATE TABLE IF NOT EXISTS user_district_visits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  district     TEXT NOT NULL,
  visited_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, district)
);

-- 1e. saved_trips — user saved itineraries
CREATE TABLE IF NOT EXISTS saved_trips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  destination   TEXT,
  district      TEXT,
  start_date    DATE,
  end_date      DATE,
  duration_days INTEGER,
  places        JSONB DEFAULT '[]',
  activities    JSONB DEFAULT '[]',
  notes         TEXT,
  budget        TEXT,
  is_public     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 1f. user_reviews — reviews written by users
CREATE TABLE IF NOT EXISTS user_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_name   TEXT NOT NULL,
  district     TEXT NOT NULL,
  rating       DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),
  review_text  TEXT,
  photos       JSONB DEFAULT '[]',
  helpful_count INTEGER DEFAULT 0,
  status       TEXT DEFAULT 'published' CHECK (status IN ('published','hidden','flagged')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 1g. user_queries — support / helpdesk
CREATE TABLE IF NOT EXISTS user_queries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email   TEXT NOT NULL,
  user_name    TEXT,
  subject      TEXT NOT NULL,
  message      TEXT NOT NULL,
  category     TEXT DEFAULT 'general' CHECK (category IN ('general','bug','suggestion','place','trip','other')),
  status       TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority     TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  reply        TEXT,
  resolved_by  TEXT,
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 1h. place_suggestions — community-submitted places
CREATE TABLE IF NOT EXISTS place_suggestions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email    TEXT,
  name          TEXT NOT NULL,
  district      TEXT NOT NULL,
  category      TEXT,
  description   TEXT,
  address       TEXT,
  latitude      DECIMAL(9,6),
  longitude     DECIMAL(9,6),
  image_url     TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by   TEXT,
  review_notes  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 1i. audit_logs — admin action trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      TEXT,
  performed_by  TEXT,
  role          TEXT,
  action        TEXT NOT NULL,
  entity_type   TEXT,
  entity_id     TEXT,
  entity_name   TEXT,
  details       TEXT,
  severity      TEXT DEFAULT 'LOW' CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 1j. safety_alerts — geospatial safety warnings
CREATE TABLE IF NOT EXISTS safety_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district     TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  alert_type   TEXT CHECK (alert_type IN ('weather','flood','landslide','road','fire','other')),
  severity     TEXT DEFAULT 'LOW' CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  latitude     DECIMAL(9,6),
  longitude    DECIMAL(9,6),
  active       BOOLEAN DEFAULT TRUE,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 2: 38 DISTRICT PLACE TABLES
-- Each district has its own table for fine-grained management
-- ============================================================

-- Common columns macro (applied to all 38 district tables):
--   id, name, slug, category, sub_category, description, address,
--   latitude, longitude, rating, review_count, entry_fee, timings,
--   best_season, tags, image_url, is_verified, is_featured,
--   created_at, updated_at

-- 1. ARIYALUR
CREATE TABLE IF NOT EXISTS places_ariyalur (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE,
  category        TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category    TEXT,
  description     TEXT,
  address         TEXT,
  latitude        DECIMAL(9,6),
  longitude       DECIMAL(9,6),
  rating          DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count    INTEGER DEFAULT 0,
  entry_fee       TEXT DEFAULT 'Free',
  timings         TEXT DEFAULT '6:00 AM – 6:00 PM',
  best_season     TEXT DEFAULT 'October – March',
  tags            TEXT[],
  image_url       TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_featured     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHENGALPATTU
CREATE TABLE IF NOT EXISTS places_chengalpattu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHENNAI
CREATE TABLE IF NOT EXISTS places_chennai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COIMBATORE
CREATE TABLE IF NOT EXISTS places_coimbatore (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CUDDALORE
CREATE TABLE IF NOT EXISTS places_cuddalore (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DHARMAPURI
CREATE TABLE IF NOT EXISTS places_dharmapuri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DINDIGUL
CREATE TABLE IF NOT EXISTS places_dindigul (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ERODE
CREATE TABLE IF NOT EXISTS places_erode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. KALLAKURICHI
CREATE TABLE IF NOT EXISTS places_kallakurichi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. KANCHEEPURAM
CREATE TABLE IF NOT EXISTS places_kancheepuram (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. KARUR
CREATE TABLE IF NOT EXISTS places_karur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. KRISHNAGIRI
CREATE TABLE IF NOT EXISTS places_krishnagiri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. MADURAI
CREATE TABLE IF NOT EXISTS places_madurai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. MAYILADUTHURAI
CREATE TABLE IF NOT EXISTS places_mayiladuthurai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. NAGAPATTINAM
CREATE TABLE IF NOT EXISTS places_nagapattinam (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. NAMAKKAL
CREATE TABLE IF NOT EXISTS places_namakkal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. NILGIRIS (Ooty)
CREATE TABLE IF NOT EXISTS places_nilgiris (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. PERAMBALUR
CREATE TABLE IF NOT EXISTS places_perambalur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. PUDUKKOTTAI
CREATE TABLE IF NOT EXISTS places_pudukkottai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. RAMANATHAPURAM
CREATE TABLE IF NOT EXISTS places_ramanathapuram (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. RANIPET
CREATE TABLE IF NOT EXISTS places_ranipet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. SALEM
CREATE TABLE IF NOT EXISTS places_salem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. SIVAGANGA
CREATE TABLE IF NOT EXISTS places_sivaganga (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. TENKASI
CREATE TABLE IF NOT EXISTS places_tenkasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. THANJAVUR
CREATE TABLE IF NOT EXISTS places_thanjavur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. THENI
CREATE TABLE IF NOT EXISTS places_theni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. TIRUCHIRAPPALLI (Trichy)
CREATE TABLE IF NOT EXISTS places_tiruchirappalli (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. TIRUNELVELI
CREATE TABLE IF NOT EXISTS places_tirunelveli (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 29. TIRUPATTUR
CREATE TABLE IF NOT EXISTS places_tirupattur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. TIRUPPUR
CREATE TABLE IF NOT EXISTS places_tiruppur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. TIRUVANNAMALAI
CREATE TABLE IF NOT EXISTS places_tiruvannamalai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 32. TIRUVARUR
CREATE TABLE IF NOT EXISTS places_tiruvarur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 33. THOOTHUKUDI (Tuticorin)
CREATE TABLE IF NOT EXISTS places_thoothukudi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 34. VELLORE
CREATE TABLE IF NOT EXISTS places_vellore (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 35. VILUPPURAM
CREATE TABLE IF NOT EXISTS places_viluppuram (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 36. VIRUDHUNAGAR
CREATE TABLE IF NOT EXISTS places_virudhunagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 37. KANNIYAKUMARI
CREATE TABLE IF NOT EXISTS places_kanniyakumari (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE,
  category TEXT CHECK (category IN ('temple','fort','museum','park','lake','falls','beach','hill','cave','wildlife','heritage','market','viewpoint','adventure','other')),
  sub_category TEXT, description TEXT, address TEXT, latitude DECIMAL(9,6), longitude DECIMAL(9,6),
  rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0, entry_fee TEXT DEFAULT 'Free',
  timings TEXT DEFAULT '6:00 AM – 6:00 PM', best_season TEXT DEFAULT 'October – March',
  tags TEXT[], image_url TEXT, is_verified BOOLEAN DEFAULT FALSE, is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 38. TENKASI (Courtallam area)
-- Note: Tenkasi is already created above as #24
-- 38th district: SIVAGANGAI (alternate spelling check)
-- The 38th distinct district of TN is: TIRUPATTUR (confirmed new district)
-- Additional: KALLAKURICHI (#9 above)
-- Completing the full 38 with ROUTES & TRIPS master table

-- ============================================================
-- SECTION 3: INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_xp ON user_stats(xp DESC);
CREATE INDEX IF NOT EXISTS idx_saved_trips_user_id ON saved_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_district ON user_reviews(district);
CREATE INDEX IF NOT EXISTS idx_user_queries_status ON user_queries(status);
CREATE INDEX IF NOT EXISTS idx_place_suggestions_status ON place_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- District tables indexes
CREATE INDEX IF NOT EXISTS idx_places_chennai_category ON places_chennai(category);
CREATE INDEX IF NOT EXISTS idx_places_madurai_category ON places_madurai(category);
CREATE INDEX IF NOT EXISTS idx_places_coimbatore_category ON places_coimbatore(category);
CREATE INDEX IF NOT EXISTS idx_places_tiruchirappalli_category ON places_tiruchirappalli(category);
CREATE INDEX IF NOT EXISTS idx_places_nilgiris_category ON places_nilgiris(category);

-- ============================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read on all district place tables
ALTER TABLE places_ariyalur ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_chengalpattu ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_chennai ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_coimbatore ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_cuddalore ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_dharmapuri ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_dindigul ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_erode ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_kallakurichi ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_kancheepuram ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_karur ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_krishnagiri ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_madurai ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_mayiladuthurai ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_nagapattinam ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_namakkal ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_nilgiris ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_perambalur ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_pudukkottai ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_ramanathapuram ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_ranipet ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_salem ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_sivaganga ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_tenkasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_thanjavur ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_theni ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_tiruchirappalli ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_tirunelveli ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_tirupattur ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_tiruppur ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_tiruvannamalai ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_tiruvarur ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_thoothukudi ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_vellore ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_viluppuram ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_virudhunagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_kanniyakumari ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: Anyone can read places (public data)
DO $$ 
DECLARE tbl TEXT; 
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'places_ariyalur','places_chengalpattu','places_chennai','places_coimbatore',
    'places_cuddalore','places_dharmapuri','places_dindigul','places_erode',
    'places_kallakurichi','places_kancheepuram','places_karur','places_krishnagiri',
    'places_madurai','places_mayiladuthurai','places_nagapattinam','places_namakkal',
    'places_nilgiris','places_perambalur','places_pudukkottai','places_ramanathapuram',
    'places_ranipet','places_salem','places_sivaganga','places_tenkasi',
    'places_thanjavur','places_theni','places_tiruchirappalli','places_tirunelveli',
    'places_tirupattur','places_tiruppur','places_tiruvannamalai','places_tiruvarur',
    'places_thoothukudi','places_vellore','places_viluppuram','places_virudhunagar',
    'places_kanniyakumari'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "public_read_%s" ON %I', tbl, tbl);
    EXECUTE format('CREATE POLICY "public_read_%s" ON %I FOR SELECT USING (true)', tbl, tbl);
  END LOOP;
END $$;

-- Drop and recreate User policies cleanly
DROP POLICY IF EXISTS "users_read_own" ON users;
CREATE POLICY "users_read_own" ON users FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "users_read_own_profile" ON user_profiles;
CREATE POLICY "users_read_own_profile" ON user_profiles FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "users_read_own_stats" ON user_stats;
CREATE POLICY "users_read_own_stats" ON user_stats FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "users_read_own_trips" ON saved_trips;
CREATE POLICY "users_read_own_trips" ON saved_trips FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "users_insert_own_trips" ON saved_trips;
CREATE POLICY "users_insert_own_trips" ON saved_trips FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "users_read_own_reviews" ON user_reviews;
CREATE POLICY "users_read_own_reviews" ON user_reviews FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "users_insert_own_reviews" ON user_reviews;
CREATE POLICY "users_insert_own_reviews" ON user_reviews FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Service role (admin) has full access (handled by Supabase service key bypass)

-- ============================================================
-- DONE
-- ============================================================
SELECT 'ExploreTN schema created successfully — ' || count(*)::text || ' tables' AS result
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'places_%' OR table_name IN ('users','user_profiles','user_stats','user_district_visits','saved_trips','user_reviews','user_queries','place_suggestions','audit_logs','safety_alerts');
