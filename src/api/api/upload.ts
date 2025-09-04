import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

export interface UploadedFile {
  url: string;
  publicId: string;
  originalName: string;
  format: string;
  size: number;
}

export interface UploadResponse {
  message: string;
  files: UploadedFile[];
  urls: string[];
}

export const uploadFiles = (files: FileList | File[]) => {
  const formData = new FormData();
  
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });

  return ApiService({
    method: 'POST',
    endpoint: apiPaths.upload.upload,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteUpload = (publicId: string) => {
  return ApiService({
    method: 'DELETE',
    endpoint: `${apiPaths.upload.upload}/${publicId}`,
  });
};