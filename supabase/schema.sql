-- ==========================================
-- EXPLORERTN SUPABASE USERS & PROFILES SCHEMA
-- Execute in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==========================================

-- 1. Create Enum for Platform User Roles (RBAC)
CREATE TYPE public.user_role AS ENUM (
  'explorer',
  'beta_tester',
  'place_manager',
  'route_manager',
  'community_manager',
  'content_editor',
  'weather_manager',
  'analytics_manager',
  'ai_manager',
  'admin',
  'super_admin'
);

-- 2. Create Users / Profiles Table linked to Supabase Auth (auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role public.user_role DEFAULT 'explorer'::public.user_role NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  rank TEXT DEFAULT 'Verified Explorer',
  district_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Security Policies
-- Policy A: Everyone can read public profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Policy B: Authenticated users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Policy C: Service Role / Super Admin can perform all operations
CREATE POLICY "Super admins have full access" 
  ON public.profiles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 5. Trigger Function: Automatically Sync Supabase Auth User ➔ Public Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name', 
      split_part(new.email, '@', 1)
    ),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN new.email = 'admin@exploretn.com' THEN 'super_admin'::public.user_role
      WHEN new.email LIKE '%@explorertn.com' THEN 'super_admin'::public.user_role
      ELSE 'explorer'::public.user_role
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach Trigger to Supabase auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Insert Initial Super Admin Seed (Optional - runs if auth user exists)
-- Seed query:
-- INSERT INTO public.profiles (id, name, email, role, rank, district_count)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Platform Super Admin', 'admin@exploretn.com', 'super_admin', 'Super Admin', 38)
-- ON CONFLICT (email) DO NOTHING;
