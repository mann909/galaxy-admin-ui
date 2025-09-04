import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as bannerApi from '../api/banner';
import { CreateBannerRequest, UpdateBannerRequest } from '../api/banner';

export const useBannersApi = (params?: Params) => {
  return useQuery({
    queryKey: ['banners', params],
    queryFn: () => bannerApi.getBanners(params),
    staleTime: 5 * 60 * 1000,
    select: (data: any) => data?.data?.response,
  });
};

export const useBannerByIdApi = (id: string) => {
  return useQuery({
    queryKey: ['banner', id],
    queryFn: () => bannerApi.getBannerById(id),
    enabled: !!id,
    select: (data: any) => data?.data?.response?.data,
  });
};

export const useCreateBannerApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBannerRequest) => bannerApi.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

export const useUpdateBannerApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateBannerRequest) => bannerApi.updateBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

export const useDeleteBannerApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bannerApi.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};