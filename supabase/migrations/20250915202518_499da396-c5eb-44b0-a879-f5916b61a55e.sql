-- Remove passport-related columns from StudentData table
ALTER TABLE public."StudentData" DROP COLUMN IF EXISTS "Passport Number";
ALTER TABLE public."StudentData" DROP COLUMN IF EXISTS "Passport Issued Date";
ALTER TABLE public."StudentData" DROP COLUMN IF EXISTS "Passport Expiry Date";