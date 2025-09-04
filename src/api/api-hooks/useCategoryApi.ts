import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as categoryApi from '../api/category';
import { Category, CreateCategoryRequest } from '../../pages/categories/interface';

export const useCategoriesApi = (params?: Params) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryApi.getCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data: any) => data?.data?.response as PaginationResponse<Category>,
  });
};

export const useCategoryByIdApi = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryApi.getCategoryById(id),
    enabled: !!id,
  });
};

export const useCreateCategoryApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategoryApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CreateCategoryRequest>) => 
      categoryApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategoryApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};