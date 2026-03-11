
-- Create storage bucket for artist audio uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-audio', 'artist-audio', false);

-- Allow authenticated users to upload their own audio files
CREATE POLICY "Users can upload their own audio"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'artist-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to read their own audio files
CREATE POLICY "Users can read their own audio"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'artist-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow service role to read all audio files (for edge functions)
CREATE POLICY "Service role can read all audio"
ON storage.objects FOR SELECT TO service_role
USING (bucket_id = 'artist-audio');

-- Allow users to delete their own audio files
CREATE POLICY "Users can delete their own audio"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'artist-audio' AND (storage.foldername(name))[1] = auth.uid()::text);
