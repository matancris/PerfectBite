-- Supabase Storage Setup for Business Assets
-- Run this in your Supabase SQL Editor

-- Create the storage bucket for business assets (logos, images, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-assets',
  'business-assets',
  true, -- Make bucket public so logos can be displayed
  2097152, -- 2MB file size limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies

-- Allow authenticated users to upload files to their business folder
CREATE POLICY "Authenticated users can upload to their business folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-assets'
);

-- Allow authenticated users to update files in their business folder
CREATE POLICY "Authenticated users can update files in their business folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-assets');

-- Allow authenticated users to delete files from their business folder
CREATE POLICY "Authenticated users can delete files from their business folder"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-assets');

-- Allow public read access to all files in the bucket (logos are public)
CREATE POLICY "Public can read business assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-assets');
