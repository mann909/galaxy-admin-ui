import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as orderApi from '../api/order';
import { UpdateOrderStatusRequest, UpdateTrackingInfoRequest } from '../api/order';

export const useOrdersApi = (params?: Params) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.getOrders(params),
    staleTime: 2 * 60 * 1000,
    select: (data: any) => data?.data?.response,
  });
};

export const useOrderByIdApi = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOrderById(id),
    enabled: !!id,
    select: (data: any) => data?.data?.response?.data,
  });
};

export const useUpdateOrderStatusApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateOrderStatusRequest) => orderApi.updateOrderStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateTrackingInfoApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateTrackingInfoRequest) => orderApi.updateTrackingInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useRefundOrderApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, refundReason }: { orderId: string; refundReason?: string }) => 
      orderApi.refundOrder(orderId, refundReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};