# Supabase Database Schema for Imani Church Manager

-- 1. PROFILES (Extends Auth.Users)
CREATE TABLE public.profiles (
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

-- 2. ATTENDANCE
CREATE TABLE public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in_at TIMESTAMPTZ DEFAULT NOW(),
  service_type TEXT DEFAULT 'Sunday Service',
  is_verified BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 3. VISITORS (For follow-up system)
CREATE TABLE public.visitors (
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
CREATE TABLE public.prayer_requests (
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
CREATE TABLE public.counseling_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_title TEXT,
  summary TEXT,
  flagged_for_pastor BOOLEAN DEFAULT FALSE,
  category TEXT, -- needs_pastor_followup, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.counseling_messages (
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
CREATE TABLE public.donations (
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
CREATE TABLE public.sermons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  speaker TEXT,
  summary TEXT,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 8. ANNOUNCEMENTS POLICIES
CREATE POLICY "Announcements are viewable by everyone." ON announcements FOR SELECT USING (true);
CREATE POLICY "Only pastors can manage announcements." ON announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pastor')
);

INSERT INTO announcements (title, content) VALUES ('Welcome to IFC Church', 'We are delighted to have you here. Join us every Sunday for a life-changing experience.');

-- RLS POLICIES

-- Profiles: Members can read all (to see names), edit own. Pastors can edit all.
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Attendance: Members see own. Pastors see all.
CREATE POLICY "Members see own attendance" ON attendance FOR SELECT USING (auth.uid() = member_id);
CREATE POLICY "Pastors see all attendance" ON attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pastor')
);

-- Counseling: STRICT PRIVACY. Only user sees own. Pastors only see if flagged.
CREATE POLICY "Users see own counseling" ON counseling_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Pastors see flagged counseling" ON counseling_sessions FOR SELECT USING (
  flagged_for_pastor = true AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pastor')
);

-- Donations: Members see own. Pastors see all.
CREATE POLICY "Members see own donations" ON donations FOR SELECT USING (auth.uid() = member_id);
CREATE POLICY "Pastors see all donations" ON donations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pastor')
);

-- Simple triggers for attendance flagging logic
-- (In a real app, you'd use a scheduled Edge Function or cron job to check for 3-week absence)
