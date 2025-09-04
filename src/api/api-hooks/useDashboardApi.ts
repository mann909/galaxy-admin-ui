import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '../api/dashboard';

export interface DashboardStats {
  summary: {
    totalUsers: number;
    totalProducts: number;
    totalCategories: number;
    totalOrders: number;
    totalOffers: number;
    totalBanners: number;
    activeOffers: number;
    totalRevenue: number;
    thisMonthRevenue: number;
    thisMonthOrders: number;
    thisMonthUsers: number;
    orderGrowth: number;
    revenueGrowth: number;
  };
  orderStatusBreakdown: {
    status: number;
    count: number;
    revenue: number;
    label: string;
  }[];
  recentOrders: {
    _id: string;
    user: {
      fullName: string;
      email: string;
    };
    totalAmount: number;
    orderStatus: number;
    createdAt: string;
  }[];
  topProducts: {
    _id: string;
    productName: string;
    brand: string;
    orderCount: number;
    totalQuantity: number;
    revenue: number;
  }[];
}

export const useDashboardStatsApi = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardApi.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data: any) => data?.data?.response as DashboardStats,
  });
};