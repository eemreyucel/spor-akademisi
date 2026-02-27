import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateAgeCategory } from '@/lib/utils/age-category';

interface CreateStudentData {
  fullName: string;
  dob: string;
  tcKimlik?: string;
  school?: string;
  address?: string;
  groupId?: string;
  monthlyFee?: number;
}

export function useCreateStudent() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStudent = async (data: CreateStudentData) => {
    setCreating(true);
    setError(null);

    const dobDate = new Date(data.dob);
    const ageCategory = calculateAgeCategory(dobDate);

    if (!ageCategory) {
      setCreating(false);
      setError('Doğum tarihine göre yaş kategorisi belirlenemedi (6-17 yaş arası olmalı).');
      return { error: 'invalid_age' };
    }

    const { data: student, error: insertErr } = await supabase
      .from('students')
      .insert({
        full_name: data.fullName,
        dob: data.dob,
        age_category: ageCategory,
        school: data.school || null,
        address: data.address || null,
      })
      .select('id')
      .single();

    if (insertErr || !student) {
      setCreating(false);
      setError('Öğrenci oluşturulurken hata oluştu.');
      return { error: insertErr?.message ?? 'unknown' };
    }

    // Optional enrollment
    if (data.groupId) {
      const today = new Date().toISOString().split('T')[0];
      const { error: enrollErr } = await supabase.from('enrollments').insert({
        student_id: student.id,
        group_id: data.groupId,
        season: '2025-2026',
        monthly_fee: data.monthlyFee ?? 0,
        start_date: today,
      });

      if (enrollErr) {
        setCreating(false);
        setError('Öğrenci oluşturuldu ama gruba kayıt yapılamadı.');
        return { error: enrollErr.message };
      }
    }

    setCreating(false);
    return { error: null };
  };

  return { creating, error, createStudent };
}
