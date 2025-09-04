import React, { useState, useEffect } from "react";
import { Box, Chip, Tooltip, Typography, Avatar, Button } from "@mui/material";
import { useGridSettings } from "../../hooks/useGridSettings";
import DefaultLayout from "../../layout/DefaultLayout";
import DynamicDataGrid, {
  DynamicColumn,
  GridData,
  GridParams,
} from "../../components/data-grid/DynamicDataGrid";
import OrderStatusModal from "../../modals/OrderStatusModal";
import OrderDetailsModal from "../../modals/OrderDetailsModal";
import toast from "react-hot-toast";
import {
  useOrdersApi,
  useUpdateOrderStatusApi,
  useRefundOrderApi,
} from "../../api/api-hooks/useOrderApi";
import { Order, UpdateOrderStatusRequest } from "./interface";

const Orders: React.FC = () => {
  const [gridData, setGridData] = useState<GridData>({ rows: [], totalCount: 0 });
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { currentParams, handleParamsChange } = useGridSettings('orders', 10);

  // API hooks
  const apiParams = {
    page: currentParams.page + 1,
    limit: currentParams.pageSize,
    filters: currentParams.filterModel.items.reduce((acc: any, item) => {
      acc[item.field] = item.value;
      return acc;
    }, {}),
    sortBy: currentParams.sortModel[0]?.field,
    sortOrder:
      currentParams.sortModel[0]?.sort === "asc"
        ? ("asc" as const)
        : currentParams.sortModel[0]?.sort === "desc"
        ? ("desc" as const)
        : undefined,
  };

  const { data: ordersData, isLoading } = useOrdersApi(apiParams);
  const {
    mutate: updateOrderStatus,
    isSuccess: updateOrderStatusSuccess,
    isError: updateOrderStatusError,
    isPending: updateOrderStatusPending,
  } = useUpdateOrderStatusApi();
  const {
    mutate: refundOrder,
    isSuccess: refundOrderSuccess,
    isError: refundOrderError,
    isPending: refundOrderPending,
  } = useRefundOrderApi();

  // Update grid data when API data changes
  useEffect(() => {
    if (ordersData) {
      console.log("Orders Data:", ordersData?.docs);
      setGridData({
        rows: ordersData?.docs || [],
        totalCount: ordersData.totalCount || 0,
      });
    }
  }, [ordersData]);

  useEffect(() => {
    if (updateOrderStatusSuccess) {
      toast.success("Order status updated successfully");
      setStatusModalOpen(false);
    }
    if (updateOrderStatusError) {
      toast.error("Failed to update order status");
    }
  }, [updateOrderStatusSuccess, updateOrderStatusError]);

  useEffect(() => {
    if (refundOrderSuccess) {
      toast.success("Order refunded successfully");
    }
    if (refundOrderError) {
      toast.error("Failed to refund order");
    }
  }, [refundOrderSuccess, refundOrderError]);

  const getOrderStatusLabel = (status: number) => {
    switch (status) {
      case -1: return "Cancelled";
      case 0: return "Not Confirmed";
      case 1: return "Confirmed";
      case 2: return "Shipped";
      case 3: return "Delivered";
      default: return "Unknown";
    }
  };

  const getPaymentStatusLabel = (status: number) => {
    switch (status) {
      case -1: return "Refunded";
      case 1: return "Pending";
      case 2: return "Confirmed";
      default: return "Unknown";
    }
  };

  const columns: DynamicColumn[] = [
    {
      field: "_id",
      headerName: "Order ID",
      width: 120,
      type: "string",
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
            #{params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "user",
      headerName: "Customer",
      width: 200,
      type: "string",
      valueGetter: (_, row) => row.user?.fullName || "Unknown Customer",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "start" }}>
          {/* <Avatar
            src={params.row.user?.profileImage}
            sx={{ width: 32, height: 32 }}
          >
            {params.row.user?.fullName?.[0]?.toUpperCase() || "?"}
          </Avatar> */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {params.row.user?.fullName || "Unknown"}
            </Typography>
            <Typography  color="textSecondary" sx={{ fontSize: '0.75rem' }}>
              {params.row.user?.email || "No email"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "products",
      headerName: "Items",
      width: 100,
      type: "number",
      valueGetter: (_, row) => row.products?.length || 0,
      renderCell: (params) => (
        <Chip
          label={`${params.value} items`}
          color="primary"
          size="small"
        />
      ),
    },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      width: 130,
      type: "number",
      renderCell: (params) => {
        const amount = Number(params.value);
        return (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ₹{!isNaN(amount) && amount !== null && amount !== undefined ? amount.toFixed(2) : "0.00"}
          </Typography>
        );
      },
    },
    {
      field: "orderStatus",
      headerName: "Order Status",
      width: 130,
      type: "string",
      valueGetter: (_, row) => getOrderStatusLabel(row.orderStatus),
      renderCell: (params) => {
        const status = params.row.orderStatus;
        const color = 
          status === 3 ? "success" :
          status === 2 ? "info" :
          status === 1 ? "warning" :
          status === -1 ? "error" : "default";
        
        return (
          <Chip
            label={params.value}
            onClick={() => handleUpdateStatus(params.row)}
            color={color}
            size="small"
          />
        );
      },
    },
    {
      field: "status",
      headerName: "Payment Status",
      width: 130,
      type: "string",
      valueGetter: (_, row) => getPaymentStatusLabel(row.status),
      renderCell: (params) => {
        const status = params.row.status;
        const color = 
          status === 2 ? "success" :
          status === 1 ? "warning" :
          status === -1 ? "error" : "default";
        
        return (
          <Chip
            label={params.value}
            color={color}
            size="small"
          />
        );
      },
    },
    {
      field: "paymentType",
      headerName: "Payment Type",
      width: 120,
      type: "string",
      renderCell: (params) => (
        <Chip
          label={params.value?.toUpperCase() || "N/A"}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: "shippingAddress",
      headerName: "Shipping Address",
      width: 200,
      type: "string",
      valueGetter: (_, row) => row.shippingAddress?.city || "No address",
      renderCell: (params) => (
        <Tooltip title={params.row.shippingAddress?.fullAddress || "No shipping address"}>
          <Box sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.row.shippingAddress?.city}, {params.row.shippingAddress?.state}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "createdAt",
      headerName: "Order Date",
      width: 130,
      type: "date",
      valueGetter: (value) => new Date(value),
      renderCell: (params) => (
        <Tooltip title={`Order placed: ${new Date(params.value).toLocaleString()}`}>
          <Typography variant="body2">{new Date(params.value).toLocaleDateString()}</Typography>
        </Tooltip>
      ),
    },
  ];


  const handleViewDetails = (row: Order) => {
    setSelectedOrder(row);
    setDetailsModalOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    if (order) {
      setSelectedOrder(order);
      setStatusModalOpen(true);
    }else{
      toast.error("Order not found");
    }
  };

  const handleStatusSubmit = async (data: UpdateOrderStatusRequest) => {
    updateOrderStatus(data);
  };

  const handleRefund = async (orderId: string) => {
    if (confirm("Are you sure you want to refund this order?")) {
      refundOrder({ orderId, refundReason: "Refunded by admin" });
    }
  };

  return (
    <DefaultLayout>
      <Box>
        <DynamicDataGrid
          id="orders"
          title="Orders Management"
          columns={columns}
          data={gridData}
          loading={isLoading}
          onParamsChange={handleParamsChange}
          onEdit={handleViewDetails}
          // onDelete={handleUpdateStatus}
        />

        <OrderDetailsModal
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          order={selectedOrder}
        />

        <OrderStatusModal
          open={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          order={selectedOrder}
          onSubmit={handleStatusSubmit}
          isLoading={updateOrderStatusPending}
        />
      </Box>
    </DefaultLayout>
  );
};

export default Orders;