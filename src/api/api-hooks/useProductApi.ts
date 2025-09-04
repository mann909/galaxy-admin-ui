import * as productApi from "../api/product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProductsApi = (params: Params) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productApi.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (data: any) => data?.data?.response as PaginationResponse<any>,
  });
};

export const useProductByIdApi = (id: string | number | null) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getProductById(id as string | number),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (data: any) => data?.data?.response as BackendResponse<any>,
  });
};

export const useCreateProductApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => productApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProductApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => productApi.updateProduct(data._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProductApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
