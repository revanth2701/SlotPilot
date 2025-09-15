-- Enable Row Level Security on StudentData (if not already enabled)
ALTER TABLE public."StudentData" ENABLE ROW LEVEL SECURITY;

-- Allow inserts during registration (both anon and authenticated),
-- so the form can save even before email confirmation creates a session
CREATE POLICY "Allow inserts into StudentData during registration"
ON public."StudentData"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to view only their own data (matched by email)
CREATE POLICY "Users can view their own StudentData"
ON public."StudentData"
FOR SELECT
TO authenticated
USING (lower("Mailid") = lower(auth.jwt() ->> 'email'));

-- Allow authenticated users to update only their own data (matched by email)
CREATE POLICY "Users can update their own StudentData"
ON public."StudentData"
FOR UPDATE
TO authenticated
USING (lower("Mailid") = lower(auth.jwt() ->> 'email'))
WITH CHECK (lower("Mailid") = lower(auth.jwt() ->> 'email'));
