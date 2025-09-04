import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as offerApi from '../api/offer';
import { Offer, CreateOfferRequest, UpdateOfferRequest } from '../../pages/offers/interface';

export const useOffersApi = (params?: Params) => {
  return useQuery({
    queryKey: ['offers', params],
    queryFn: () => offerApi.getOffers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data: any) => data?.data?.response as PaginationResponse<Offer>,
  });
};

export const useOfferByIdApi = (id: string) => {
  return useQuery({
    queryKey: ['offer', id],
    queryFn: () => offerApi.getOfferById(id),
    enabled: !!id,
    select: (data: any) => data?.data?.response as Offer,
  });
};

export const useCreateOfferApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOfferRequest) => offerApi.createOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};

export const useUpdateOfferApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateOfferRequest) => 
      offerApi.updateOffer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};

export const useDeleteOfferApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => offerApi.deleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};