-- Create storage bucket for student documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('student-documents', 'student-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);

-- Create table for document metadata
CREATE TABLE public.student_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
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

-- Create RLS policies for student_documents
CREATE POLICY "Students can view their own documents"
ON public.student_documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can upload their own documents"
ON public.student_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own documents"
ON public.student_documents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Students can delete their own documents"
ON public.student_documents
FOR DELETE
USING (auth.uid() = user_id);

-- Create storage policies for student documents
CREATE POLICY "Students can view their own document files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can upload their own document files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can update their own document files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can delete their own document files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create index for better performance
CREATE INDEX idx_student_documents_user_type ON public.student_documents(user_id, document_type);
CREATE INDEX idx_student_documents_uploaded_at ON public.student_documents(uploaded_at DESC);