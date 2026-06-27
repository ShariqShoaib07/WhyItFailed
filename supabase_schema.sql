-- SQL Schema for FailLog (Supabase Postgres)

-- 1. Create Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  university TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Failures Table
CREATE TABLE IF NOT EXISTS public.failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Robotics', 'AI/ML', 'Web/App', 'Embedded', 'Hardware', 'Other')),
  problem TEXT NOT NULL,
  what_tried TEXT NOT NULL,
  why_failed TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on failures
ALTER TABLE public.failures ENABLE ROW LEVEL SECURITY;

-- 3. Create Upvotes Table
CREATE TABLE IF NOT EXISTS public.upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  failure_id UUID NOT NULL REFERENCES public.failures(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_failure_user_upvote UNIQUE (failure_id, user_id)
);

-- Enable RLS on upvotes
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- DATABASE TRIGGERS
-- =========================================================================

-- Trigger to automatically create a profile row when a new user signs up via Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, university)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New User'),
    NULL
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Trigger to automatically update failure upvote counts
CREATE OR REPLACE FUNCTION public.handle_upvote_change()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.failures
    SET upvote_count = upvote_count + 1
    WHERE id = new.failure_id;
    RETURN new;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.failures
    SET upvote_count = upvote_count - 1
    WHERE id = old.failure_id;
    RETURN old;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_upvote_inserted_or_deleted ON public.upvotes;
CREATE TRIGGER on_upvote_inserted_or_deleted
  AFTER INSERT OR DELETE ON public.upvotes
  FOR EACH ROW EXECUTE FUNCTION public.handle_upvote_change();


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Profiles RLS Policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Failures RLS Policies
DROP POLICY IF EXISTS "Failures are viewable by everyone" ON public.failures;
CREATE POLICY "Failures are viewable by everyone" ON public.failures
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert their own failures" ON public.failures;
CREATE POLICY "Authenticated users can insert their own failures" ON public.failures
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own failures" ON public.failures;
CREATE POLICY "Users can update their own failures" ON public.failures
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own failures" ON public.failures;
CREATE POLICY "Users can delete their own failures" ON public.failures
  FOR DELETE USING (auth.uid() = user_id);

-- Upvotes RLS Policies
DROP POLICY IF EXISTS "Upvotes are viewable by everyone" ON public.upvotes;
CREATE POLICY "Upvotes are viewable by everyone" ON public.upvotes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can upvote" ON public.upvotes;
CREATE POLICY "Authenticated users can upvote" ON public.upvotes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own upvotes" ON public.upvotes;
CREATE POLICY "Users can remove their own upvotes" ON public.upvotes
  FOR DELETE USING (auth.uid() = user_id);


-- =========================================================================
-- STORAGE CONFIGURATION & POLICIES
-- =========================================================================

-- Create bucket 'failure-images' if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('failure-images', 'failure-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'failure-images');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'failure-images' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can delete their own uploaded images" ON storage.objects;
CREATE POLICY "Users can delete their own uploaded images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'failure-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
