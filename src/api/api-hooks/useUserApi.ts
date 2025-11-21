import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '../api/user';

export const useUsersApi = (params?: Params) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.getUsers(params),
    staleTime: 5 * 60 * 1000,
    select: (data: any) => data?.data?.response,
  });
};