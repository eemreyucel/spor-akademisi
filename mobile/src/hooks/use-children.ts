import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export interface ChildItem {
  studentId: string;
  studentName: string;
  sportName: string;
  groupName: string;
  ageCategory: string;
  enrollmentId: string | null;
}

export function useChildren() {
  const { profile } = useAuth();
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    setError(null);

    const { data: links, error: err } = await supabase
      .from('parent_students')
      .select(
        'student_id, students(id, full_name, dob, age_category, enrollments(id, status, groups(name, sports(name))))'
      )
      .eq('parent_profile_id', profile.id);

    if (err) {
      setError('Veriler yüklenirken hata oluştu.');
      setLoading(false);
      return;
    }

    const items: ChildItem[] = [];

    for (const link of links ?? []) {
      const studentArr = link.students;
      const student = Array.isArray(studentArr) ? studentArr[0] : studentArr;
      if (!student) continue;

      const enrollments = (student as any).enrollments ?? [];

      if (enrollments.length === 0) {
        items.push({
          studentId: (student as any).id,
          studentName: (student as any).full_name,
          sportName: '',
          groupName: '',
          ageCategory: (student as any).age_category ?? '',
          enrollmentId: null,
        });
        continue;
      }

      for (const enrollment of enrollments) {
        const groups = enrollment.groups;
        const group = Array.isArray(groups) ? groups[0] : groups;
        const sports = group?.sports;
        const sport = Array.isArray(sports) ? sports[0] : sports;

        items.push({
          studentId: (student as any).id,
          studentName: (student as any).full_name,
          sportName: sport?.name ?? '',
          groupName: group?.name ?? '',
          ageCategory: (student as any).age_category ?? '',
          enrollmentId: enrollment.id,
        });
      }
    }

    setChildren(items);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { children, loading, error, refetch: fetch };
}
