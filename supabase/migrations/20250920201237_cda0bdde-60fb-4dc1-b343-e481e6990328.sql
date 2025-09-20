-- Create storage bucket for student documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-documents', 'student-documents', false);

-- Create RLS policies for student documents
CREATE POLICY "Students can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'student-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create table to track uploaded documents
CREATE TABLE public.student_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  student_email VARCHAR NOT NULL,
  student_first_name VARCHAR NOT NULL,
  student_last_name VARCHAR NOT NULL,
  document_type VARCHAR NOT NULL,
  file_name VARCHAR NOT NULL,
  file_path VARCHAR NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on student_documents table
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_documents table
CREATE POLICY "Students can view their own document records" 
ON public.student_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own document records" 
ON public.student_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own document records" 
ON public.student_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Students can delete their own document records" 
ON public.student_documents 
FOR DELETE 
USING (auth.uid() = user_id);