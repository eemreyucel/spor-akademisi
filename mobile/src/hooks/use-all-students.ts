import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface StudentOption {
  id: string;
  fullName: string;
}

export function useAllStudents() {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('students')
      .select('id, full_name')
      .is('deleted_at', null)
      .order('full_name');

    if (err) {
      setError('Öğrenciler yüklenirken hata oluştu.');
      setLoading(false);
      return;
    }

    setStudents(
      (data ?? []).map((s) => ({ id: s.id, fullName: s.full_name }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { students, loading, error, refetch: fetch };
}
