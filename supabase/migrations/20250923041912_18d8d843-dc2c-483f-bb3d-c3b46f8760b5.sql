-- Create student_documents table if not exists (with extra metadata columns used in UI)
CREATE TABLE IF NOT EXISTS public.student_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  student_email TEXT,
  student_first_name TEXT,
  student_last_name TEXT,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Policies for student_documents (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'student_documents' 
      AND policyname = 'Students can view their own documents'
  ) THEN
    CREATE POLICY "Students can view their own documents"
    ON public.student_documents
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'student_documents' 
      AND policyname = 'Students can upload their own documents'
  ) THEN
    CREATE POLICY "Students can upload their own documents"
    ON public.student_documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'student_documents' 
      AND policyname = 'Students can update their own documents'
  ) THEN
    CREATE POLICY "Students can update their own documents"
    ON public.student_documents
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'student_documents' 
      AND policyname = 'Students can delete their own documents'
  ) THEN
    CREATE POLICY "Students can delete their own documents"
    ON public.student_documents
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_student_documents_user_type ON public.student_documents(user_id, document_type);
CREATE INDEX IF NOT EXISTS idx_student_documents_uploaded_at ON public.student_documents(uploaded_at DESC);

-- Storage policies for bucket 'student-documents' (without re-inserting bucket)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'Students can view own student-documents files'
  ) THEN
    CREATE POLICY "Students can view own student-documents files"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'student-documents'
      AND EXISTS (
        SELECT 1 FROM public.student_documents d
        WHERE d.file_path = name AND d.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'Authenticated can upload to student-documents'
  ) THEN
    CREATE POLICY "Authenticated can upload to student-documents"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'student-documents' AND auth.role() = 'authenticated'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'Students can update own student-documents files'
  ) THEN
    CREATE POLICY "Students can update own student-documents files"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'student-documents'
      AND EXISTS (
        SELECT 1 FROM public.student_documents d
        WHERE d.file_path = name AND d.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'Students can delete own student-documents files'
  ) THEN
    CREATE POLICY "Students can delete own student-documents files"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'student-documents'
      AND EXISTS (
        SELECT 1 FROM public.student_documents d
        WHERE d.file_path = name AND d.user_id = auth.uid()
      )
    );
  END IF;
END $$;