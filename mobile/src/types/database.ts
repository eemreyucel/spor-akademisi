export type UserRole = 'admin' | 'coach' | 'parent';

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused';

export type PaymentStatus = 'pending' | 'paid' | 'overdue';

export type EnrollmentStatus = 'active' | 'inactive' | 'frozen';

export type AgeCategory = 'minik_a' | 'minik_b' | 'kucukler' | 'yildizlar' | 'gencler';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  profession: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProfileRole {
  id: string;
  profile_id: string;
  role: UserRole;
  created_at: string;
}

export interface Student {
  id: string;
  full_name: string;
  dob: string;
  school: string | null;
  address: string | null;
  age_category: AgeCategory;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Sport {
  id: string;
  name: string;
  created_at: string;
}

export interface Group {
  id: string;
  sport_id: string;
  coach_profile_id: string | null;
  name: string;
  age_category: AgeCategory;
  schedule_description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sports?: Sport;
}

export interface Enrollment {
  id: string;
  student_id: string;
  group_id: string;
  season: string;
  status: EnrollmentStatus;
  monthly_fee: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  groups?: Group;
  students?: Student;
}

export interface Attendance {
  id: string;
  enrollment_id: string;
  date: string;
  status: AttendanceStatus;
  marked_by_profile_id: string;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  enrollment_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: PaymentStatus;
  period_month: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  enrollments?: {
    students?: { full_name: string };
    groups?: { name: string; sports?: { name: string } };
  };
}

export interface ParentStudent {
  id: string;
  parent_profile_id: string;
  student_id: string;
  created_at: string;
  students?: Student & {
    enrollments?: (Enrollment & {
      groups?: Group & {
        sports?: Sport;
      };
    })[];
  };
}

export interface Invitation {
  id: string;
  token: string;
  role: UserRole;
  email: string | null;
  student_id: string | null;
  created_by: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profession: string | null;
  roles: UserRole[];
}
