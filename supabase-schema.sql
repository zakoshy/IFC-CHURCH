-- Supabase Database Schema for Imani Church Manager

-- 1. PROFILES (Extends Auth.Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT UNIQUE,
  role TEXT DEFAULT 'member' CHECK (role IN ('pastor', 'member')),
  avatar_url TEXT,
  last_attendance_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure columns exist if table was created in an earlier session
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone_number') THEN
    ALTER TABLE public.profiles ADD COLUMN phone_number TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_attendance_at') THEN
    ALTER TABLE public.profiles ADD COLUMN last_attendance_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- 2. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in_at TIMESTAMPTZ DEFAULT NOW(),
  service_type TEXT DEFAULT 'Sunday Service',
  is_verified BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 3. VISITORS (For follow-up system)
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  first_visit_at TIMESTAMPTZ DEFAULT NOW(),
  follow_up_status TEXT DEFAULT 'pending' CHECK (follow_up_status IN ('pending', 'contacted', 'closed')),
  pastor_notes TEXT,
  referred_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- 4. PRAYER REQUESTS
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_text TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  needs_attention BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'prayed_for', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- 5. COUNSELING SESSIONS (AI-powered counseling)
CREATE TABLE IF NOT EXISTS public.counseling_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_title TEXT,
  summary TEXT,
  flagged_for_pastor BOOLEAN DEFAULT FALSE,
  category TEXT, -- needs_pastor_followup, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.counseling_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.counseling_sessions(id) ON DELETE CASCADE,
  sender TEXT CHECK (sender IN ('user', 'ai')),
  content TEXT NOT NULL,
  bible_verses JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_messages ENABLE ROW LEVEL SECURITY;

-- 6. DONATIONS (M-Pesa Transactions)
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.profiles(id),
  amount DECIMAL(12,2) NOT NULL,
  type TEXT CHECK (type IN ('tithe', 'offering', 'donation', 'other')),
  mpesa_receipt_number TEXT UNIQUE,
  phone_number TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- 7. SERMONS & ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.sermons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  speaker TEXT,
  content TEXT,
  summary TEXT,
  media_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was created in an earlier session
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sermons' AND column_name='is_published') THEN
    ALTER TABLE public.sermons ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sermons' AND column_name='content') THEN
    ALTER TABLE public.sermons ADD COLUMN content TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sermons' AND column_name='summary') THEN
    ALTER TABLE public.sermons ADD COLUMN summary TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sermons' AND column_name='speaker') THEN
    ALTER TABLE public.sermons ADD COLUMN speaker TEXT;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was created in an earlier session
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='content') THEN
    ALTER TABLE public.announcements ADD COLUMN content TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='image_url') THEN
    ALTER TABLE public.announcements ADD COLUMN image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='is_active') THEN
    ALTER TABLE public.announcements ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 7.1 SERMON POLICIES
DROP POLICY IF EXISTS "Sermons are viewable by members when published." ON sermons;
CREATE POLICY "Sermons are viewable by members when published." ON sermons FOR SELECT USING (
  is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pastor')
);

DROP POLICY IF EXISTS "Only pastors can manage sermons." ON sermons;
CREATE POLICY "Only pastors can manage sermons." ON sermons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pastor')
);

-- 8. ANNOUNCEMENTS POLICIES
DROP POLICY IF EXISTS "Announcements are viewable by everyone." ON announcements;
CREATE POLICY "Announcements are viewable by everyone." ON announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only pastors can manage announcements." ON announcements;
CREATE POLICY "Only pastors can manage announcements." ON announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pastor')
);

-- 9. AI USAGE TRACKING
CREATE TABLE IF NOT EXISTS public.ai_usage (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  sermon_gen_count INT DEFAULT 0,
  chat_msg_count INT DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON ai_usage;
CREATE POLICY "Users can view own usage" ON ai_usage FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON ai_usage;
CREATE POLICY "Users can update own usage" ON ai_usage FOR ALL USING (auth.uid() = user_id);

-- RLS POLICIES

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile." ON profiles;
CREATE POLICY "Users can insert own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Attendance
DROP POLICY IF EXISTS "Members see own attendance" ON attendance;
CREATE POLICY "Members see own attendance" ON attendance FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can insert own attendance" ON attendance;
CREATE POLICY "Users can insert own attendance" ON attendance FOR INSERT WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "Pastors see all attendance" ON attendance;
CREATE POLICY "Pastors see all attendance" ON attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pastor')
);

-- Prayer Requests
DROP POLICY IF EXISTS "Users see own prayer requests" ON prayer_requests;
CREATE POLICY "Users see own prayer requests" ON prayer_requests FOR SELECT USING (auth.uid() = user_id OR is_private = false);

DROP POLICY IF EXISTS "Users can insert own prayer requests" ON prayer_requests;
CREATE POLICY "Users can insert own prayer requests" ON prayer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pastors see all prayer requests" ON prayer_requests;
CREATE POLICY "Pastors see all prayer requests" ON prayer_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pastor')
);

-- Counseling
DROP POLICY IF EXISTS "Users see own counseling" ON counseling_sessions;
CREATE POLICY "Users see own counseling" ON counseling_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can start own counseling" ON counseling_sessions;
CREATE POLICY "Users can start own counseling" ON counseling_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pastors see flagged counseling" ON counseling_sessions;
CREATE POLICY "Pastors see flagged counseling" ON counseling_sessions FOR SELECT USING (
  flagged_for_pastor = true AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pastor')
);

DROP POLICY IF EXISTS "Users see own messages" ON counseling_messages;
CREATE POLICY "Users see own messages" ON counseling_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM counseling_sessions WHERE id = session_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can send own messages" ON counseling_messages;
CREATE POLICY "Users can send own messages" ON counseling_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM counseling_sessions WHERE id = session_id AND user_id = auth.uid())
);

-- Donations
DROP POLICY IF EXISTS "Members see own donations" ON donations;
CREATE POLICY "Members see own donations" ON donations FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Members can record own donations" ON donations;
CREATE POLICY "Members can record own donations" ON donations FOR INSERT WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "Pastors see all donations" ON donations;
CREATE POLICY "Pastors see all donations" ON donations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pastor')
);

-- 8. AUTOMATIC PROFILE CREATION ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Member'),
    COALESCE(new.raw_user_meta_data->>'role', 'member')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Simple triggers for attendance flagging logic
-- (In a real app, you'd use a scheduled Edge Function or cron job to check for 3-week absence)
