-- Storage policies to allow authenticated students to upload to the private 'student-documents' bucket
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated uploads to student-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read own files in student-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files in student-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files in student-documents" ON storage.objects;

-- Allow authenticated users to INSERT (upload) into the 'student-documents' bucket
CREATE POLICY "Allow authenticated uploads to student-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-documents');

-- Allow users to SELECT (read/list) only their own files in this bucket
CREATE POLICY "Allow users to read own files in student-documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'student-documents' AND owner = auth.uid());

-- Allow users to UPDATE only their own files in this bucket
CREATE POLICY "Allow users to update own files in student-documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'student-documents' AND owner = auth.uid())
WITH CHECK (bucket_id = 'student-documents' AND owner = auth.uid());

-- Allow users to DELETE only their own files in this bucket
CREATE POLICY "Allow users to delete own files in student-documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'student-documents' AND owner = auth.uid());