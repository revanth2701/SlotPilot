-- Enable Row Level Security on Studentpersonaldata table
ALTER TABLE public."Studentpersonaldata" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the Studentpersonaldata table
CREATE POLICY "Users can view their own personal data" 
ON public."Studentpersonaldata" 
FOR SELECT 
USING (lower("Email") = lower((auth.jwt() ->> 'email'::text)));

CREATE POLICY "Users can insert their own personal data" 
ON public."Studentpersonaldata" 
FOR INSERT 
WITH CHECK (lower("Email") = lower((auth.jwt() ->> 'email'::text)));

CREATE POLICY "Users can update their own personal data" 
ON public."Studentpersonaldata" 
FOR UPDATE 
USING (lower("Email") = lower((auth.jwt() ->> 'email'::text)))
WITH CHECK (lower("Email") = lower((auth.jwt() ->> 'email'::text)));

CREATE POLICY "Allow inserts during registration for Studentpersonaldata"
ON public."Studentpersonaldata"
FOR INSERT
WITH CHECK (true);