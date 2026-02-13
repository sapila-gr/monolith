import { supabase } from "@/lib/supabase";

/**
 * Upload an image file to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `images/${filename}`;

  const { error } = await supabase.storage.from("posts").upload(path, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return getPublicUrl(path);
}

/**
 * Get the public URL for a file in the "posts" bucket.
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from("posts").getPublicUrl(path);
  return data.publicUrl;
}
