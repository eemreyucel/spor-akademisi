import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import type { AttendanceStatus } from '@/types/database';

interface StudentAttendance {
  enrollmentId: string;
  studentName: string;
  status: AttendanceStatus;
}

const STATUS_CYCLE: AttendanceStatus[] = ['present', 'absent_unexcused', 'absent_excused'];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function useAttendanceTaking(groupId: string | null) {
  const { profile } = useAuth();
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (!groupId || !profile) {
      setStudents([]);
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    // Fetch active enrollments for this group
    const { data: enrollments, error: enrollErr } = await supabase
      .from('enrollments')
      .select('id, students(full_name)')
      .eq('group_id', groupId)
      .eq('status', 'active');

    if (enrollErr) {
      setError('Öğrenciler yüklenirken hata oluştu.');
      setLoading(false);
      return;
    }

    const enrollmentIds = (enrollments ?? []).map((e) => e.id);

    // Fetch existing attendance for today
    const today = getToday();
    const { data: existing } = await supabase
      .from('attendance')
      .select('enrollment_id, status')
      .eq('date', today)
      .in('enrollment_id', enrollmentIds);

    const existingMap = new Map(
      (existing ?? []).map((a) => [a.enrollment_id, a.status as AttendanceStatus])
    );

    const items: StudentAttendance[] = (enrollments ?? []).map((e: any) => {
      const student = Array.isArray(e.students) ? e.students[0] : e.students;
      return {
        enrollmentId: e.id,
        studentName: student?.full_name ?? '',
        status: existingMap.get(e.id) ?? 'present',
      };
    });

    items.sort((a, b) => a.studentName.localeCompare(b.studentName, 'tr'));
    setStudents(items);
    setLoading(false);
  }, [groupId, profile]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const toggleStatus = (enrollmentId: string) => {
    setSaved(false);
    setStudents((prev) =>
      prev.map((s) => {
        if (s.enrollmentId !== enrollmentId) return s;
        const currentIndex = STATUS_CYCLE.indexOf(s.status);
        const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
        return { ...s, status: nextStatus };
      })
    );
  };

  const saveAttendance = async () => {
    if (!profile || students.length === 0) return;

    setSaving(true);
    setError(null);

    const today = getToday();
    const now = new Date().toISOString();

    const records = students.map((s) => ({
      id: `${s.enrollmentId}_${today}`,
      enrollment_id: s.enrollmentId,
      date: today,
      status: s.status,
      marked_by_profile_id: profile.id,
      synced_at: now,
      created_at: now,
      updated_at: now,
    }));

    const { error: upsertErr } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'enrollment_id,date' });

    setSaving(false);

    if (upsertErr) {
      setError('Yoklama kaydedilirken hata oluştu.');
      return;
    }

    setSaved(true);
  };

  return { students, loading, saving, saved, error, toggleStatus, saveAttendance };
}
