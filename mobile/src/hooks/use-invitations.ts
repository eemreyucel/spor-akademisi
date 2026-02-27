import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import { SUPABASE_URL } from '@/lib/constants';
import type { Invitation, UserRole } from '@/types/database';

export type InvitationStatus = 'active' | 'used' | 'expired';

export interface InvitationItem extends Invitation {
  computedStatus: InvitationStatus;
}

function computeStatus(inv: Invitation): InvitationStatus {
  if (inv.used_at) return 'used';
  if (new Date(inv.expires_at) < new Date()) return 'expired';
  return 'active';
}

interface CreateInvitationData {
  role: UserRole;
  email?: string;
  studentId?: string;
}

export function useInvitations() {
  const { profile } = useAuth();
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError('Davetler yüklenirken hata oluştu.');
      setLoading(false);
      return;
    }

    const items: InvitationItem[] = (data ?? []).map((inv: Invitation) => ({
      ...inv,
      computedStatus: computeStatus(inv),
    }));

    setInvitations(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createInvitation = async (data: CreateInvitationData) => {
    if (!profile) return { error: 'Profil bulunamadı.' };

    setCreating(true);
    setError(null);

    const { data: inv, error: err } = await supabase
      .from('invitations')
      .insert({
        role: data.role,
        email: data.email || null,
        student_id: data.studentId || null,
        created_by: profile.id,
      })
      .select('*')
      .single();

    setCreating(false);

    if (err || !inv) {
      setError('Davet oluşturulurken hata oluştu.');
      return { error: err?.message ?? 'unknown' };
    }

    // Add to local state
    setInvitations((prev) => [
      { ...inv, computedStatus: computeStatus(inv) } as InvitationItem,
      ...prev,
    ]);

    return { error: null, token: inv.token };
  };

  const deleteInvitation = async (id: string) => {
    const { error: err } = await supabase
      .from('invitations')
      .delete()
      .eq('id', id);

    if (err) {
      setError('Davet silinirken hata oluştu.');
      return;
    }

    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
  };

  const getInviteLink = (token: string): string => {
    // Web app'in signup URL'ini kullanıyoruz
    const webOrigin = SUPABASE_URL.replace('.supabase.co', '').includes('arvfntgtelpxvgruteth')
      ? 'https://spor-akademisi.vercel.app'
      : 'http://localhost:3000';
    return `${webOrigin}/signup?token=${token}`;
  };

  return {
    invitations,
    loading,
    creating,
    error,
    refetch: fetch,
    createInvitation,
    deleteInvitation,
    getInviteLink,
  };
}
