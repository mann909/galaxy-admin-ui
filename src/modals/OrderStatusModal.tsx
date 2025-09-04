import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { X } from "lucide-react";
import { Order, UpdateOrderStatusRequest } from "../pages/orders/interface";

interface OrderStatusModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onSubmit: (data: UpdateOrderStatusRequest) => Promise<void>;
  isLoading?: boolean;
}

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  open,
  onClose,
  order,
  onSubmit,
  isLoading = false,
}) => {
  const [orderStatus, setOrderStatus] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (open && order) {
      setOrderStatus(order.orderStatus);
      setAdminNotes(order.adminNotes || "");
    }
  }, [open, order]);

  const handleSubmit = async () => {
    if (!order) return;

    const data: UpdateOrderStatusRequest = {
      _id: order._id,
      orderStatus,
      adminNotes: adminNotes.trim() || undefined,
    };

    await onSubmit(data);
  };

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

  if (!order) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
          Update Order Status
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Card sx={{ mb: 2, boxShadow: 1 }}>
          <CardContent>
            <Typography variant="body2" color="textSecondary">Order ID</Typography>
            <Typography variant="h6" sx={{ fontFamily: "monospace" }}>
              #{order._id.slice(-8)}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Customer: {order.user?.fullName || "Unknown"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Current Status: {getOrderStatusLabel(order.orderStatus)}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Order Status</InputLabel>
            <Select
              value={orderStatus}
              label="Order Status"
              onChange={(e) => setOrderStatus(Number(e.target.value))}
              disabled={isLoading}
            >
              <MenuItem value={-1}>Cancelled</MenuItem>
              <MenuItem value={0}>Not Confirmed</MenuItem>
              <MenuItem value={1}>Confirmed</MenuItem>
              <MenuItem value={2}>Shipped</MenuItem>
              <MenuItem value={3}>Delivered</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Admin Notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            multiline
            rows={3}
            disabled={isLoading}
            placeholder="Add notes about this status update..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <Button onClick={onClose} disabled={isLoading} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{ borderRadius: 2, px: 4 }}
        >
          {isLoading ? "Updating..." : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderStatusModal;