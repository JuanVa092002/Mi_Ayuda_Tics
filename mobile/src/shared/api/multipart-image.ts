import { mapUnknownFetchError } from '@/shared/api/fetch-error';
import {
  appendUploadFile,
  inferMimeFromFileName,
  normalizeImageFileName,
  normalizeImageMime,
  type PickerAssetLike,
} from '@/shared/media/create-upload-file';

export { inferMimeFromFileName, normalizeImageFileName, normalizeImageMime };
export type MultipartImageInput = PickerAssetLike;

export type MultipartImagePart = {
  uri: string;
  type: string;
  name: string;
};

/** MIME/filename mapping only — expo/fetch cannot serialize this object as a file part. */
export function toMultipartImagePart(input: {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
}): MultipartImagePart {
  const type = normalizeImageMime(input.mimeType ?? inferMimeFromFileName(input.fileName));
  return {
    uri: input.uri,
    type,
    name: normalizeImageFileName(input.fileName, type),
  };
}

export async function appendImageToFormData(
  formData: FormData,
  field: string,
  input: PickerAssetLike,
): Promise<void> {
  try {
    await appendUploadFile(formData, field, input);
  } catch (error) {
    throw mapUnknownFetchError(error);
  }
}
