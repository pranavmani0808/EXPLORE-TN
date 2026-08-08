-- ==============================================================================
-- EXPLORERTN RBAC & AUDIT LOG SCHEME FOR SUPABASE POSTGRESQL + POSTGIS
-- ==============================================================================

-- 1. Create Enums for Platform Roles & User Status
CREATE TYPE user_role AS ENUM (
  'explorer',
  'place_manager',
  'route_manager',
  'community_manager',
  'super_admin'
);

CREATE TYPE user_status AS ENUM (
  'active',
  'suspended',
  'pending'
);

CREATE TYPE audit_action AS ENUM (
  'CREATED',
  'UPDATED',
  'VERIFIED',
  'DELETED',
  'APPROVED',
  'REJECTED',
  'ROLE_CHANGED',
  'STATUS_CHANGED',
  'BACKUP'
);

-- 2. Create Users / Profiles Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'explorer',
  status user_status NOT NULL DEFAULT 'active',
  explorer_rank TEXT NOT NULL DEFAULT 'Level 0 Explorer',
  xp INTEGER NOT NULL DEFAULT 0,
  district_count INTEGER NOT NULL DEFAULT 0,
  last_login TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast RBAC lookups
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Super Admins can manage all users"
  ON public.users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 3. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role user_role NOT NULL,
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL, -- e.g. 'user', 'place', 'route', 'media', 'review'
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  description TEXT,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for audit search & timeline query
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs viewable by staff & super admins"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('super_admin', 'place_manager', 'route_manager', 'community_manager')
    )
  );

CREATE POLICY "Audit logs insertable by authenticated users"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 4. Create Places Table
CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  category TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  elevation TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Places are viewable by anyone"
  ON public.places FOR SELECT
  USING (TRUE);

CREATE POLICY "Place Managers & Super Admins can insert/update places"
  ON public.places FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('super_admin', 'place_manager')
    )
  );

-- 5. Create Routes Table
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  district TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  distance_km DOUBLE PRECISION NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Routes are viewable by anyone"
  ON public.routes FOR SELECT
  USING (TRUE);

CREATE POLICY "Route Managers & Super Admins can manage routes"
  ON public.routes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('super_admin', 'route_manager')
    )
  );

-- 6. RPC Function to Get Live Dashboard Telemetry Counts
CREATE OR REPLACE FUNCTION public.get_dashboard_telemetry()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_users_count INT;
  v_active_today INT;
  v_places_count INT;
  v_verified_places INT;
  v_pending_places INT;
  v_routes_count INT;
  v_audit_count INT;
BEGIN
  SELECT COUNT(*) INTO v_users_count FROM public.users;
  SELECT COUNT(*) INTO v_active_today FROM public.users WHERE last_login >= NOW() - INTERVAL '24 hours';
  SELECT COUNT(*) INTO v_places_count FROM public.places;
  SELECT COUNT(*) INTO v_verified_places FROM public.places WHERE verified = TRUE;
  SELECT COUNT(*) INTO v_pending_places FROM public.places WHERE verified = FALSE;
  SELECT COUNT(*) INTO v_routes_count FROM public.routes;
  SELECT COUNT(*) INTO v_audit_count FROM public.audit_logs;

  RETURN jsonb_build_object(
    'registered_users', COALESCE(v_users_count, 0),
    'active_users_today', COALESCE(v_active_today, 0),
    'total_places', COALESCE(v_places_count, 0),
    'verified_places', COALESCE(v_verified_places, 0),
    'pending_places', COALESCE(v_pending_places, 0),
    'total_routes', COALESCE(v_routes_count, 0),
    'audit_logs_count', COALESCE(v_audit_count, 0)
  );
END;
$$;

-- 7. Trigger to Automatic Profile Sync on Supabase Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url, role, explorer_rank, xp)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    'explorer',
    'Level 0 Explorer',
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    last_login = NOW();
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
