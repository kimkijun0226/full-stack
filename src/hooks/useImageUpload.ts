import { topicApi } from "@/api";
import { useMutation } from "@tanstack/react-query";

/**
 * File이면 Supabase Storage에 업로드 후 URL 반환
 * string이면 그대로 반환
 * null이면 null 반환
 */
async function resolveImageUrl(image: File | string | null): Promise<string | null> {
  if (!image) return null;
  if (image instanceof File) return topicApi.uploadThumbnail(image);
  return image;
}

export function useImageUpload() {
  const upload = useMutation({
    mutationFn: (image: File | string | null) => resolveImageUrl(image),
  });

  return { upload };
}
