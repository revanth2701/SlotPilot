ALTER TABLE public."StudentData"
  ALTER COLUMN "Registrationid" TYPE bigint USING "Registrationid"::bigint;