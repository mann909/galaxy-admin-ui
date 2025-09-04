import { useQuery, useMutation } from "@tanstack/react-query";
import * as authApi from "../api/auth";
import { useSelector } from "react-redux";
import { useRef } from "react";

/**
 * Custom hook for verifying authentication tokens
 * @param isInitialLoad - Boolean indicating if this is the initial page load
 * @returns Query result object for the token verification
 */
export const useVerifyTokensApi = () => {
  const isLoggedIn = useSelector((state: any) => state.user.isLoggedIn);
  const verificationCount = useRef(0);

  return useQuery({
    queryKey: ["verifyTokens"],
    queryFn: () => {

      // remove this code, its just for development
      verificationCount.current+=1;
      console.log("Calling VerifyTokens, count : ", verificationCount.current)
      return authApi.verifyTokens()
    },

    // Important settings to control when the query runs
    gcTime: 0, // Don't cache results
    staleTime: 0, // Always consider data stale
    enabled: true,
    refetchOnWindowFocus: false,
    retryOnMount: false,
    refetchOnMount: false,  

    // automatic refetching every 2 minutes
    refetchInterval: isLoggedIn ? 2 * 60 * 1000 : false,

    // Don't retry failed requests to avoid multiple error toasts
    retry: 0,

    // Don't refetch on reconnect to avoid unnecessary calls
    refetchOnReconnect: false,
  });
};

export const useLoginApi = () => {
  return useMutation({
    mutationFn: (data: any) => authApi.login(data),
  });
};

export const useLogoutApi = () => {
  return useMutation({
    mutationFn: () => authApi.logout(),
  });
};

// Change password
export const useChangePasswordApi = () => {
  return useMutation({
    mutationFn: (data: {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => authApi.changePassword(data),
  });
};
