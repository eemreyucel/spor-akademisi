import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { PaymentStatus } from '@/types/database';

export interface PaymentItem {
  id: string;
  studentName: string;
  groupName: string;
  sportName: string;
  periodMonth: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
}

export function usePayments() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('payments')
      .select('*, enrollments(students(full_name), groups(name, sports(name)))')
      .order('due_date', { ascending: false });

    if (err) {
      setError('Ödemeler yüklenirken hata oluştu.');
      setLoading(false);
      return;
    }

    const items: PaymentItem[] = (data ?? []).map((p: any) => {
      const students = p.enrollments?.students;
      const student = Array.isArray(students) ? students[0] : students;
      const groups = p.enrollments?.groups;
      const group = Array.isArray(groups) ? groups[0] : groups;
      const sports = group?.sports;
      const sport = Array.isArray(sports) ? sports[0] : sports;

      return {
        id: p.id,
        studentName: student?.full_name ?? '',
        groupName: group?.name ?? '',
        sportName: sport?.name ?? '',
        periodMonth: p.period_month,
        amount: p.amount,
        dueDate: p.due_date,
        status: p.status as PaymentStatus,
      };
    });

    setPayments(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { payments, loading, error, refetch: fetch };
}
