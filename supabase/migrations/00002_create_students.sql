CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  dob DATE NOT NULL,
  tc_kimlik_encrypted BYTEA,
  tc_kimlik_hash TEXT,
  school TEXT,
  address TEXT,
  age_category TEXT NOT NULL CHECK (age_category IN ('minik_a', 'minik_b', 'kucukler', 'yildizlar', 'gencler')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_students_tc_hash ON students(tc_kimlik_hash);
CREATE INDEX idx_students_age_category ON students(age_category);

CREATE TABLE parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(parent_profile_id, student_id)
);
