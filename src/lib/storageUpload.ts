import { supabase } from '@/lib/supabase';

export const LEARNING_CENTER_BUCKET = 'learning-center';

export type UploadResult = { url: string; path: string } | { error: string };

const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '-');

// Uploads a file to a public Supabase Storage bucket and returns its public
// URL. Used by the Learning Center admin to upload digital manuals (PDFs,
// docs, etc.) and video files, per module.
export async function uploadPublicFile(
  file: File,
  folder: string,
  bucket: string = LEARNING_CENTER_BUCKET,
): Promise<UploadResult> {
  const path = `${folder}/${Date.now()}-${sanitize(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) return { error: error.message };
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deletePublicFile(path: string, bucket: string = LEARNING_CENTER_BUCKET) {
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}
