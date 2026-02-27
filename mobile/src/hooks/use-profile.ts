import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

interface UpdateProfileData {
  full_name: string;
  phone: string;
  profession: string;
}

export function useProfile() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: UpdateProfileData) => {
    if (!profile) return { error: 'Profil bulunamadı.' };

    setSaving(true);
    setError(null);

    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        profession: data.profession || null,
      })
      .eq('id', profile.id);

    setSaving(false);

    if (err) {
      const msg = 'Profil güncellenirken hata oluştu.';
      setError(msg);
      return { error: msg };
    }

    await refreshProfile();
    return { error: null };
  };

  return { profile, saving, error, updateProfile };
}
