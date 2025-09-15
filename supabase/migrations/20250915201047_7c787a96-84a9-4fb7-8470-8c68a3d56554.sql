-- Fix out-of-range inserts by widening Registrationid type
ALTER TABLE public."StudentData"
  ALTER COLUMN "Registrationid" TYPE bigint USING "Registrationid"::bigint;