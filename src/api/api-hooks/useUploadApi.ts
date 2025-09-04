import { useMutation } from '@tanstack/react-query';
import * as uploadApi from '../api/upload';

export const useUploadFilesApi = () => {
  return useMutation({
    mutationFn: ({ files }: { files: FileList | File[]; }) => 
      uploadApi.uploadFiles(files),
    onError: (error) => {
      console.error('Upload error:', error);
    },
  });
};

export const useDeleteUploadApi = () => {
  return useMutation({
    mutationFn: (publicId: string) => uploadApi.deleteUpload(publicId),
    onError: (error) => {
      console.error('Delete upload error:', error);
    },
  });
};