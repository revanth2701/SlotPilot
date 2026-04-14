-- Add verified column to VisaExperiences (default false = pending admin review)
ALTER TABLE public."VisaExperiences"
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;

-- Allow authenticated users (admin) to UPDATE (mark as verified)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'VisaExperiences'
      AND policyname = 'Allow authenticated update on VisaExperiences'
  ) THEN
    CREATE POLICY "Allow authenticated update on VisaExperiences"
    ON public."VisaExperiences"
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;
