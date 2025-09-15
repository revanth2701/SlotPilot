-- Add RLS policies for EmployerData table (currently has RLS enabled but no policies)
CREATE POLICY "Employers can view their own data" 
ON public."EmployerData" 
FOR SELECT 
USING (lower("Mail Id") = lower((auth.jwt() ->> 'email'::text)));

CREATE POLICY "Employers can insert their own data" 
ON public."EmployerData" 
FOR INSERT 
WITH CHECK (lower("Mail Id") = lower((auth.jwt() ->> 'email'::text)));

CREATE POLICY "Employers can update their own data" 
ON public."EmployerData" 
FOR UPDATE 
USING (lower("Mail Id") = lower((auth.jwt() ->> 'email'::text)))
WITH CHECK (lower("Mail Id") = lower((auth.jwt() ->> 'email'::text)));

CREATE POLICY "Allow inserts during employer registration"
ON public."EmployerData"
FOR INSERT
WITH CHECK (true);