import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import type { AttendanceStatus, PaymentStatus } from '@/types/database';

export interface ChildDetail {
  studentId: string;
  studentName: string;
  dob: string;
  ageCategory: string;
  enrollments: {
    enrollmentId: string;
    groupName: string;
    sportName: string;
    scheduleDescription: string | null;
    attendance: { date: string; status: AttendanceStatus }[];
    payments: {
      id: string;
      periodMonth: string;
      amount: number;
      status: PaymentStatus;
      dueDate: string;
    }[];
  }[];
}

export function useChildDetail(studentId: string) {
  const { profile } = useAuth();
  const [detail, setDetail] = useState<ChildDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!profile || !studentId) return;

    setLoading(true);
    setError(null);

    // Fetch student info
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id, full_name, dob, age_category')
      .eq('id', studentId)
      .single();

    if (studentErr || !student) {
      setError('Öğrenci bilgileri yüklenemedi.');
      setLoading(false);
      return;
    }

    // Fetch enrollments with groups
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('id, groups(name, schedule_description, sports(name))')
      .eq('student_id', studentId);

    const enrollmentDetails = [];

    for (const enrollment of enrollments ?? []) {
      const groups = enrollment.groups;
      const group = Array.isArray(groups) ? groups[0] : groups;
      const sports = (group as any)?.sports;
      const sport = Array.isArray(sports) ? sports[0] : sports;

      // Fetch attendance for this enrollment
      const { data: attendance } = await supabase
        .from('attendance')
        .select('date, status')
        .eq('enrollment_id', enrollment.id)
        .order('date', { ascending: false })
        .limit(30);

      // Fetch payments for this enrollment
      const { data: payments } = await supabase
        .from('payments')
        .select('id, period_month, amount, status, due_date')
        .eq('enrollment_id', enrollment.id)
        .order('due_date', { ascending: false });

      enrollmentDetails.push({
        enrollmentId: enrollment.id,
        groupName: (group as any)?.name ?? '',
        sportName: sport?.name ?? '',
        scheduleDescription: (group as any)?.schedule_description ?? null,
        attendance: (attendance ?? []).map((a) => ({
          date: a.date,
          status: a.status as AttendanceStatus,
        })),
        payments: (payments ?? []).map((p) => ({
          id: p.id,
          periodMonth: p.period_month,
          amount: p.amount,
          status: p.status as PaymentStatus,
          dueDate: p.due_date,
        })),
      });
    }

    setDetail({
      studentId: student.id,
      studentName: student.full_name,
      dob: student.dob,
      ageCategory: student.age_category,
      enrollments: enrollmentDetails,
    });

    setLoading(false);
  }, [profile, studentId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { detail, loading, error, refetch: fetch };
}
