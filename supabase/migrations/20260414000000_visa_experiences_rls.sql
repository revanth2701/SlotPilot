-- Allow anyone (including anonymous users) to insert into VisaExperiences
-- This supports the public community form which does not require authentication.

ALTER TABLE public."VisaExperiences" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'VisaExperiences'
      AND policyname = 'Allow public insert on VisaExperiences'
  ) THEN
    CREATE POLICY "Allow public insert on VisaExperiences"
    ON public."VisaExperiences"
    FOR INSERT
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'VisaExperiences'
      AND policyname = 'Allow public select on VisaExperiences'
  ) THEN
    CREATE POLICY "Allow public select on VisaExperiences"
    ON public."VisaExperiences"
    FOR SELECT
    USING (true);
  END IF;
END $$;
