import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import { getPrimaryRole } from '@/lib/utils/role-helpers';

export interface GroupItem {
  id: string;
  name: string;
  sportName: string;
  ageCategory: string;
  coachName: string | null;
  scheduleDescription: string | null;
}

export function useGroups() {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    setError(null);

    let query = supabase
      .from('groups')
      .select('id, name, age_category, schedule_description, sports(name), coach_profile_id, profiles!groups_coach_profile_id_fkey(full_name)')
      .is('deleted_at', null)
      .order('name');

    const role = getPrimaryRole(profile.roles);
    if (role === 'coach') {
      query = query.eq('coach_profile_id', profile.id);
    }

    const { data, error: err } = await query;

    if (err) {
      setError('Gruplar yüklenirken hata oluştu.');
      setLoading(false);
      return;
    }

    const items: GroupItem[] = (data ?? []).map((g: any) => {
      const sports = g.sports;
      const sport = Array.isArray(sports) ? sports[0] : sports;
      const profiles = g.profiles;
      const coach = Array.isArray(profiles) ? profiles[0] : profiles;

      return {
        id: g.id,
        name: g.name,
        sportName: sport?.name ?? '',
        ageCategory: g.age_category,
        coachName: coach?.full_name ?? null,
        scheduleDescription: g.schedule_description,
      };
    });

    setGroups(items);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { groups, loading, error, refetch: fetch };
}
