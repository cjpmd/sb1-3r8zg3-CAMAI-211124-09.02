import { supabase } from './supabase';

export const SUBSCRIPTION_LIMITS = {
  free: 50,
  pro: Infinity,
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_LIMITS;

export interface UploadStats {
  currentCount: number;
  limit: number;
  remainingUploads: number;
  canUpload: boolean;
}

export async function getMonthlyUploadStats(userId: string, tier: SubscriptionTier): Promise<UploadStats> {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const { data: uploadData, error } = await supabase
    .from('video_uploads')
    .select('upload_count')
    .eq('user_id', userId)
    .eq('upload_month', firstDayOfMonth.toISOString().split('T')[0])
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching upload stats:', error);
    throw error;
  }

  const currentCount = uploadData?.upload_count || 0;
  const limit = SUBSCRIPTION_LIMITS[tier];
  const remainingUploads = Math.max(0, limit - currentCount);

  return {
    currentCount,
    limit,
    remainingUploads,
    canUpload: currentCount < limit,
  };
}

export async function incrementUploadCount(userId: string): Promise<void> {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthDate = firstDayOfMonth.toISOString().split('T')[0];

  const { data: existingRecord, error: fetchError } = await supabase
    .from('video_uploads')
    .select('id, upload_count')
    .eq('user_id', userId)
    .eq('upload_month', monthDate)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching upload record:', fetchError);
    throw fetchError;
  }

  if (existingRecord) {
    const { error: updateError } = await supabase
      .from('video_uploads')
      .update({ upload_count: existingRecord.upload_count + 1 })
      .eq('id', existingRecord.id);

    if (updateError) {
      console.error('Error updating upload count:', updateError);
      throw updateError;
    }
  } else {
    const { error: insertError } = await supabase
      .from('video_uploads')
      .insert([
        {
          user_id: userId,
          upload_month: monthDate,
          upload_count: 1,
        },
      ]);

    if (insertError) {
      console.error('Error inserting upload record:', insertError);
      throw insertError;
    }
  }
}
