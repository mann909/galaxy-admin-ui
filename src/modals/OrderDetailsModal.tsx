import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import { X } from "lucide-react";
import { Order } from "../pages/orders/interface";

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  open,
  onClose,
  order,
}) => {
  if (!order) return null;

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

  const getOrderStatusColor = (status: number) => {
    switch (status) {
      case 3: return "success";
      case 2: return "info";
      case 1: return "warning";
      case -1: return "error";
      default: return "default";
    }
  };

  const getPaymentStatusColor = (status: number) => {
    switch (status) {
      case 2: return "success";
      case 1: return "warning";
      case -1: return "error";
      default: return "default";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            minHeight: "80vh",
            maxHeight: "95vh",
            width: "95vw",
            maxWidth: "1200px",
          },
        },
      }}
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
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
          Order Details #{order._id.slice(-8)}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3 }}>
        {/* Order Summary */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Order Summary
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">Order Status</Typography>
                <Chip
                  label={getOrderStatusLabel(order.orderStatus)}
                  color={getOrderStatusColor(order.orderStatus) as any}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Payment Status</Typography>
                <Chip
                  label={getPaymentStatusLabel(order.status)}
                  color={getPaymentStatusColor(order.status) as any}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Payment Type</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {order.paymentType?.toUpperCase() || "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Total Amount</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#059669" }}>
                  ₹{!isNaN(order.totalAmount) ? order.totalAmount?.toFixed(2) : "0.00"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Customer Information
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={order.user?.profileImage}
                sx={{ width: 60, height: 60 }}
              >
                {order.user?.fullName?.[0]?.toUpperCase() || "?"}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {order.user?.fullName || "Unknown Customer"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {order.user?.email || "No email"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {order.user?.phoneNumber || "No phone"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Shipping Address
            </Typography>
            <Typography variant="body1">
              {order.shippingAddress?.fullAddress || "No shipping address available"}
            </Typography>
            <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>City:</strong> {order.shippingAddress?.city || "N/A"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>State:</strong> {order.shippingAddress?.state || "N/A"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>PIN:</strong> {order.shippingAddress?.pinCode || "N/A"}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Order Products */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Order Items ({order.products?.length || 0})
            </Typography>
            {order.products?.map((product, index) => (
              <Box key={index}>
                <Box sx={{ display: "flex", gap: 2, p: 2, backgroundColor: "#f8fafc", borderRadius: 1 }}>
                  {/* Product Image */}
                  <Avatar
                    src={product.variantSnapshot?.color?.images?.[0] || product.productSnapshot?.productImages?.[0]}
                    sx={{ width: 80, height: 80, borderRadius: 1 }}
                  >
                    {product.productSnapshot?.name?.[0]?.toUpperCase() || "?"}
                  </Avatar>

                  {/* Product Details */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {product.productSnapshot?.name || "Unknown Product"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Brand: {product.productSnapshot?.brand || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      SKU: {product.variantSnapshot?.sku || "N/A"}
                    </Typography>
                    
                    {/* Variant Details */}
                    {product.variantSnapshot && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Size:</strong> {product.variantSnapshot.size?.name || "N/A"} ({product.variantSnapshot.size?.code || "N/A"})
                        </Typography>
                        <Typography variant="body2">
                          <strong>Color:</strong> {product.variantSnapshot.color?.name || "N/A"}
                        </Typography>
                        {product.variantSnapshot.size?.capacity && (
                          <Typography variant="body2">
                            <strong>Capacity:</strong> {product.variantSnapshot.size.capacity}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Pricing & Quantity */}
                  <Box sx={{ textAlign: "right", minWidth: 150 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      ₹{product.pricingSnapshot?.actualPaidPrice?.toFixed(2) || "0.00"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Qty: {product.quantity || 0}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
                      Total: ₹{product.itemTotal?.toFixed(2) || "0.00"}
                    </Typography>
                    {product.pricingSnapshot?.basePrice !== product.pricingSnapshot?.actualPaidPrice && (
                      <Typography variant="body2" sx={{ textDecoration: "line-through", color: "#64748b" }}>
                        ₹{product.pricingSnapshot?.basePrice?.toFixed(2) || "0.00"}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {index < (order.products?.length || 0) - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Order Totals */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Order Totals
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">Subtotal</Typography>
                <Typography variant="body1">₹{order.orderTotals?.subtotal?.toFixed(2) || "0.00"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Tax Amount</Typography>
                <Typography variant="body1">₹{order.orderTotals?.totalTaxAmount?.toFixed(2) || "0.00"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Shipping Charges</Typography>
                <Typography variant="body1">₹{order.shippingCharges?.toFixed(2) || "0.00"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Platform Fees</Typography>
                <Typography variant="body1">₹{order.orderTotals?.platformFees?.toFixed(2) || "0.00"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Total Discount</Typography>
                <Typography variant="body1" sx={{ color: "#059669" }}>
                  -₹{order.orderTotals?.totalDiscount?.toFixed(2) || "0.00"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Final Total</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#059669" }}>
                  ₹{order.orderTotals?.finalTotal?.toFixed(2) || "0.00"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Coupon Information */}
        {order.couponSnapshot && (
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
                Applied Coupon
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Coupon Code</Typography>
                  <Typography variant="body1" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                    {order.couponSnapshot.couponCode}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Discount</Typography>
                  <Typography variant="body1" sx={{ color: "#059669", fontWeight: 600 }}>
                    ₹{order.couponSnapshot.discountAmount?.toFixed(2)} ({order.couponSnapshot.discountType})
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: "span 2" }}>
                  <Typography variant="body2" color="textSecondary">Description</Typography>
                  <Typography variant="body1">{order.couponSnapshot.description || "No description"}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tracking Information */}
        {order.trackingInfo && (
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
                Tracking Information
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Tracking ID</Typography>
                  <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                    {order.trackingInfo.trackingId || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Carrier</Typography>
                  <Typography variant="body1">{order.trackingInfo.carrier || "N/A"}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Estimated Delivery</Typography>
                  <Typography variant="body1">
                    {order.trackingInfo.estimatedDelivery 
                      ? new Date(order.trackingInfo.estimatedDelivery).toLocaleDateString()
                      : "N/A"
                    }
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Delivered At</Typography>
                  <Typography variant="body1">
                    {order.trackingInfo.deliveredAt 
                      ? new Date(order.trackingInfo.deliveredAt).toLocaleDateString()
                      : "Not delivered"
                    }
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Order Notes */}
        {(order.orderNotes || order.adminNotes) && (
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
                Notes
              </Typography>
              {order.orderNotes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Customer Notes</Typography>
                  <Typography variant="body1">{order.orderNotes}</Typography>
                </Box>
              )}
              {order.adminNotes && (
                <Box>
                  <Typography variant="body2" color="textSecondary">Admin Notes</Typography>
                  <Typography variant="body1">{order.adminNotes}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Invoice Information */}
        {(order.invoice || order.invoiceNumber) && (
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
                Invoice Information
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                {order.invoiceNumber && (
                  <Box>
                    <Typography variant="body2" color="textSecondary">Invoice Number</Typography>
                    <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                      {order.invoiceNumber}
                    </Typography>
                  </Box>
                )}
                {order.invoice && (
                  <Box>
                    <Typography variant="body2" color="textSecondary">Invoice Type</Typography>
                    <Typography variant="body1">{order.invoice.invoiceType || "N/A"}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Order Timestamps */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: "#1e293b", fontWeight: 600 }}>
              Order Timeline
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">Order Placed</Typography>
                <Typography variant="body1">
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Last Updated</Typography>
                <Typography variant="body1">
                  {new Date(order.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsModal;