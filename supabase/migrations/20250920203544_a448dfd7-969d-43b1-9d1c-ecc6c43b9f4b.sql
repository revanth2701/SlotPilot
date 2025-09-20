-- Storage policies to allow authenticated students to upload to the private 'student-documents' bucket
-- NOTE: We purposely avoid using CHECKs that depend on time or mutable functions as per best practices

-- Allow authenticated users to INSERT (upload) into the 'student-documents' bucket
create policy if not exists "Allow authenticated uploads to student-documents"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'student-documents');

-- Allow users to SELECT (read/list) only their own files in this bucket
create policy if not exists "Allow users to read own files in student-documents"
on storage.objects
for select
to authenticated
using (bucket_id = 'student-documents' and owner = auth.uid());

-- Allow users to UPDATE only their own files in this bucket
create policy if not exists "Allow users to update own files in student-documents"
on storage.objects
for update
to authenticated
using (bucket_id = 'student-documents' and owner = auth.uid())
with check (bucket_id = 'student-documents' and owner = auth.uid());

-- Allow users to DELETE only their own files in this bucket
create policy if not exists "Allow users to delete own files in student-documents"
on storage.objects
for delete
to authenticated
using (bucket_id = 'student-documents' and owner = auth.uid());