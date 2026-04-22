import { supabase } from './supabase';

export interface Usage {
  user_id: string;
  sermon_gen_count: number;
  chat_msg_count: number;
  last_reset_at: string;
}

const SERMON_LIMIT = 5;
const CHAT_LIMIT = 20;

export async function getAIUsage(userId: string): Promise<Usage | null> {
  const { data, error } = await supabase
    .from('ai_usage')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // If usage record doesn't exist, create one
    const { data: newData, error: createError } = await supabase
      .from('ai_usage')
      .insert([{ user_id: userId }])
      .select()
      .single();
    
    if (createError) return null;
    return newData;
  }

  return data;
}

export async function checkLimit(userId: string, type: 'sermon' | 'chat'): Promise<{ allowed: boolean; remaining: number }> {
  const usage = await getAIUsage(userId);
  if (!usage) return { allowed: false, remaining: 0 };

  const limit = type === 'sermon' ? SERMON_LIMIT : CHAT_LIMIT;
  const current = type === 'sermon' ? usage.sermon_gen_count : usage.chat_msg_count;

  return {
    allowed: current < limit,
    remaining: Math.max(0, limit - current)
  };
}

export async function incrementUsage(userId: string, type: 'sermon' | 'chat'): Promise<void> {
  const field = type === 'sermon' ? 'sermon_gen_count' : 'chat_msg_count';
  
  // Note: We use rpc or direct update. For simplicity in this demo, direct update.
  // In a production app, use an atomic increment in Postgres.
  const usage = await getAIUsage(userId);
  if (!usage) return;

  const current = type === 'sermon' ? usage.sermon_gen_count : usage.chat_msg_count;

  await supabase
    .from('ai_usage')
    .update({ [field]: current + 1 })
    .eq('user_id', userId);
}
