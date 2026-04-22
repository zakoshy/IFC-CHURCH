export type UserRole = 'pastor' | 'member';

export interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  role: UserRole;
  avatar_url?: string;
  last_attendance_at?: string;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  check_in_at: string;
  service_type: string;
  is_verified: boolean;
  member?: Profile;
}

export interface Donation {
  id: string;
  member_id: string;
  amount: number;
  type: 'tithe' | 'offering' | 'donation' | 'other';
  mpesa_receipt_number: string;
  status: string;
  created_at: string;
}

export interface PrayerRequest {
  id: string;
  user_id: string;
  request_text: string;
  is_private: boolean;
  status: 'active' | 'prayed_for' | 'resolved';
  created_at: string;
  user?: Profile;
}

export interface CounselingResponse {
  response: string;
  bible_verses: string[];
  category: 'needs_pastor_followup' | 'general_encouragement' | 'prayer_request' | 'serious_emotional_distress';
}
