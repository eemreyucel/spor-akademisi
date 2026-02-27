CREATE OR REPLACE FUNCTION has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profile_roles pr
    JOIN profiles p ON p.id = pr.profile_id
    WHERE p.user_id = auth.uid() AND pr.role = check_role
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_coach_of_group(g_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM groups g
    JOIN profiles p ON p.id = g.coach_profile_id
    WHERE g.id = g_id AND p.user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_parent_of_student(s_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM parent_students ps
    JOIN profiles p ON p.id = ps.parent_profile_id
    WHERE ps.student_id = s_id AND p.user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (user_id = auth.uid() OR has_role('admin'));
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL USING (has_role('admin'));

ALTER TABLE profile_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON profile_roles FOR SELECT USING (profile_id = get_profile_id() OR has_role('admin'));
CREATE POLICY "Admin manage roles" ON profile_roles FOR ALL USING (has_role('admin'));

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access students" ON students FOR ALL USING (has_role('admin'));
CREATE POLICY "Coach read own group students" ON students FOR SELECT USING (
  has_role('coach') AND EXISTS (
    SELECT 1 FROM enrollments e
    JOIN groups g ON g.id = e.group_id
    WHERE e.student_id = students.id AND is_coach_of_group(g.id)
  )
);
CREATE POLICY "Parent read own children" ON students FOR SELECT USING (
  has_role('parent') AND is_parent_of_student(students.id)
);

ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access parent_students" ON parent_students FOR ALL USING (has_role('admin'));
CREATE POLICY "Parent read own links" ON parent_students FOR SELECT USING (parent_profile_id = get_profile_id());

ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone reads sports" ON sports FOR SELECT USING (true);
CREATE POLICY "Admin manage sports" ON sports FOR ALL USING (has_role('admin'));

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access groups" ON groups FOR ALL USING (has_role('admin'));
CREATE POLICY "Coach read own groups" ON groups FOR SELECT USING (has_role('coach') AND coach_profile_id = get_profile_id());
CREATE POLICY "Parent read child groups" ON groups FOR SELECT USING (
  has_role('parent') AND EXISTS (
    SELECT 1 FROM enrollments e
    JOIN parent_students ps ON ps.student_id = e.student_id
    WHERE e.group_id = groups.id AND ps.parent_profile_id = get_profile_id()
  )
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access enrollments" ON enrollments FOR ALL USING (has_role('admin'));
CREATE POLICY "Coach read own group enrollments" ON enrollments FOR SELECT USING (
  has_role('coach') AND is_coach_of_group(enrollments.group_id)
);
CREATE POLICY "Parent read own child enrollments" ON enrollments FOR SELECT USING (
  has_role('parent') AND is_parent_of_student(enrollments.student_id)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access attendance" ON attendance FOR ALL USING (has_role('admin'));
CREATE POLICY "Coach manage own group attendance" ON attendance FOR ALL USING (
  has_role('coach') AND EXISTS (
    SELECT 1 FROM enrollments e WHERE e.id = attendance.enrollment_id AND is_coach_of_group(e.group_id)
  )
);
CREATE POLICY "Parent read own child attendance" ON attendance FOR SELECT USING (
  has_role('parent') AND EXISTS (
    SELECT 1 FROM enrollments e WHERE e.id = attendance.enrollment_id AND is_parent_of_student(e.student_id)
  )
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access payments" ON payments FOR ALL USING (has_role('admin'));
CREATE POLICY "Parent read own child payments" ON payments FOR SELECT USING (
  has_role('parent') AND EXISTS (
    SELECT 1 FROM enrollments e WHERE e.id = payments.enrollment_id AND is_parent_of_student(e.student_id)
  )
);

ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access sync_conflicts" ON sync_conflicts FOR ALL USING (has_role('admin'));
