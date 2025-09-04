import React from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  Skeleton
} from '@mui/material';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  Gift,
  Image,
  FolderTree,
  ArrowUp,
  ArrowDown,
  IndianRupee
} from 'lucide-react';
import DefaultLayout from '../../layout/DefaultLayout';
import { useDashboardStatsApi } from '../../api/api-hooks/useDashboardApi';

const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useDashboardStatsApi();

  const getOrderStatusColor = (status: number) => {
    switch (status) {
      case 3: return 'success';
      case 2: return 'info';
      case 1: return 'warning';
      case -1: return 'error';
      default: return 'default';
    }
  };

  const getOrderStatusLabel = (status: number): string => {
    switch (status) {
      case -1: return "Cancelled";
      case 0: return "Not Confirmed";
      case 1: return "Confirmed";
      case 2: return "Shipped";
      case 3: return "Delivered";
      default: return "Unknown";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Grid container spacing={3}>
            {[1,2,3,4,5,6].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rectangular" height={100} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DefaultLayout>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: dashboardData?.summary?.totalUsers?.toLocaleString() || '0',
      icon: <Users size={32} />,
      color: '#1976d2',
      growth: null,
    },
    {
      title: 'Total Orders',
      value: dashboardData?.summary?.totalOrders?.toLocaleString() || '0',
      icon: <ShoppingCart size={32} />,
      color: '#2e7d32',
      growth: dashboardData?.summary?.orderGrowth,
    },
    {
      title: 'Products',
      value: dashboardData?.summary?.totalProducts?.toLocaleString() || '0',
      icon: <Package size={32} />,
      color: '#ed6c02',
      growth: null,
    },
    {
      title: 'Revenue',
      value: formatCurrency(dashboardData?.summary?.totalRevenue || 0),
      icon: <IndianRupee size={32} />,
      color: '#9c27b0',
      growth: dashboardData?.summary?.revenueGrowth,
    },
    {
      title: 'Categories',
      value: dashboardData?.summary?.totalCategories?.toLocaleString() || '0',
      icon: <FolderTree size={32} />,
      color: '#7c3aed',
      growth: null,
    },
    {
      title: 'Active Offers',
      value: dashboardData?.summary?.activeOffers?.toLocaleString() || '0',
      icon: <Gift size={32} />,
      color: '#dc2626',
      growth: null,
    },
  ];

  return (
    <DefaultLayout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "#1e293b" }}>
          Dashboard
        </Typography>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box 
                      sx={{ 
                        color: stat.color,
                        backgroundColor: `${stat.color}15`,
                        borderRadius: 2,
                        p: 1.5
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                      {stat.growth !== null && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                          { stat?.growth && stat?.growth >= 0 ? (
                            <ArrowUp size={14} color="#16a34a" />
                          ) : (
                            <ArrowDown size={14} color="#dc2626" />
                          )}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: stat?.growth && stat.growth >= 0 ? "#16a34a" : "#dc2626",
                              fontWeight: 600
                            }}
                          >
                            {Math.abs(stat.growth || 0).toFixed(1)}%
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Orders and Analytics */}
        <Grid container spacing={3}>
          {/* Recent Orders */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#1e293b" }}>
                  Recent Orders
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(dashboardData?.recentOrders || []).map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                {order.user?.fullName?.[0]?.toUpperCase() || "?"}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {order.user?.fullName || "Unknown"}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {order.user?.email || ""}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrency(order.totalAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getOrderStatusLabel(order.orderStatus)}
                              color={getOrderStatusColor(order.orderStatus) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Status Breakdown */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#1e293b" }}>
                  Order Status Breakdown
                </Typography>
                {(dashboardData?.orderStatusBreakdown || []).map((statusData) => (
                  <Box key={statusData.status} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2">{statusData.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {statusData.count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(statusData.count / (dashboardData?.summary?.totalOrders || 1)) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Top Products */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#1e293b" }}>
                  Top Selling Products
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Orders</TableCell>
                        <TableCell align="center">Quantity Sold</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(dashboardData?.topProducts || []).map((product, index) => (
                        <TableRow key={product._id}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 1,
                                  backgroundColor: "#f1f5f9",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 600,
                                  color: "#475569"
                                }}
                              >
                                #{index + 1}
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {product.productName || "Unknown Product"}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {product.brand || "No Brand"}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={product.orderCount}
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {product.totalQuantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#059669" }}>
                              {formatCurrency(product.revenue)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DefaultLayout>
  );
};

export default Dashboard;