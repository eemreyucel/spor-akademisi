import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { PaymentStatus } from '@/types/database';

export interface AdminPaymentItem {
  id: string;
  studentName: string;
  groupName: string;
  sportName: string;
  periodMonth: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
}

export function useAdminPayments() {
  const [payments, setPayments] = useState<AdminPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

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

    const items: AdminPaymentItem[] = (data ?? []).map((p: any) => {
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

  const markAsPaid = async (paymentId: string) => {
    setMarkingId(paymentId);

    const today = new Date().toISOString().split('T')[0];
    const { error: err } = await supabase
      .from('payments')
      .update({ status: 'paid', paid_date: today })
      .eq('id', paymentId);

    setMarkingId(null);

    if (err) {
      setError('Ödeme güncellenirken hata oluştu.');
      return;
    }

    // Update local state
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'paid' as PaymentStatus } : p))
    );
  };

  return { payments, loading, error, refetch: fetch, markAsPaid, markingId };
}
