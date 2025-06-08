import { supabase } from './supabaseClient';

export const uploadFile = async (file: File): Promise<string | null> => {
  const filePath = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('cms-uploads')
    .upload(filePath, file);

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from('cms-uploads')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};