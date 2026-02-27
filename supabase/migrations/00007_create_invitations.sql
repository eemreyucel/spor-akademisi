-- Invitation system: Only invited users can sign up
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('coach', 'parent')),
  email TEXT,
  student_id UUID REFERENCES students(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "admin_manage_invitations" ON invitations
  FOR ALL USING (has_role('admin'));

-- Public read for token validation (via service role in API, but allow select for token check)
CREATE POLICY "public_validate_token" ON invitations
  FOR SELECT USING (true);
