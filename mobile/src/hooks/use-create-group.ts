import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SportOption {
  id: string;
  name: string;
}

interface CoachOption {
  profileId: string;
  fullName: string;
}

interface CreateGroupData {
  name: string;
  sportId: string;
  ageCategory: string;
  coachProfileId?: string;
  scheduleDescription?: string;
}

export function useCreateGroup() {
  const [sports, setSports] = useState<SportOption[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    setLoading(true);

    const [sportsRes, coachesRes] = await Promise.all([
      supabase.from('sports').select('id, name').order('name'),
      supabase
        .from('profile_roles')
        .select('profile_id, profiles(full_name)')
        .eq('role', 'coach'),
    ]);

    setSports(
      (sportsRes.data ?? []).map((s) => ({ id: s.id, name: s.name }))
    );

    setCoaches(
      (coachesRes.data ?? []).map((r: any) => {
        const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
        return {
          profileId: r.profile_id,
          fullName: profile?.full_name ?? '',
        };
      })
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const createGroup = async (data: CreateGroupData) => {
    setCreating(true);
    setError(null);

    const { error: err } = await supabase.from('groups').insert({
      name: data.name,
      sport_id: data.sportId,
      age_category: data.ageCategory,
      coach_profile_id: data.coachProfileId || null,
      schedule_description: data.scheduleDescription || null,
    });

    setCreating(false);

    if (err) {
      setError('Grup oluşturulurken hata oluştu.');
      return { error: err.message };
    }

    return { error: null };
  };

  return { sports, coaches, loading, creating, error, createGroup };
}
