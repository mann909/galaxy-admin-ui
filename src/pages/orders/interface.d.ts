export interface Order {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImage?: string;
  };
  totalAmount: number;
  status: number;
  orderStatus: number;
  products: OrderProduct[];
  shippingAddress: ShippingAddress;
  shippingCharges: number;
  platformFees: number;
  platformFeesGst: number;
  orderTotals: OrderTotals;
  couponSnapshot?: CouponSnapshot;
  freeProducts?: FreeProduct[];
  paymentId?: string;
  paymentType: string;
  refunded: boolean;
  invoice?: Invoice;
  invoiceNumber?: string;
  trackingInfo?: TrackingInfo;
  orderNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderProduct {
  productId: string;
  variantId?: string;
  productSnapshot: {
    name: string;
    brand: string;
    category: string;
    description: string;
    features: string[];
    weight: string;
    productImages: string[];
  };
  variantSnapshot?: {
    sku: string;
    size: {
      name: string;
      code: string;
      capacity: string;
      dimensions: {
        length: number;
        width: number;
        height: number;
        unit: string;
      };
    };
    color: {
      name: string;
      code: string;
      hexCode: string;
      images: string[];
    };
  };
  pricingSnapshot: {
    basePrice: number;
    salePrice?: number;
    actualPaidPrice: number;
    currency: string;
    taxes: {
      cgst?: number;
      sgst?: number;
      igst?: number;
      utgst?: number;
      totalTaxAmount: number;
    };
  };
  quantity: number;
  selectedOptions: {
    color: string;
    size: string;
    colorHex: string;
    selectedImage: string;
  };
  itemSubtotal: number;
  itemTaxAmount: number;
  itemTotal: number;
}

export interface ShippingAddress {
  country: string;
  state: string;
  city: string;
  pinCode: string;
  societyName: string;
  houseNumber: string;
  street: string;
  fullAddress: string;
}

export interface OrderTotals {
  subtotal: number;
  totalTaxAmount: number;
  totalDiscount: number;
  shippingCharges: number;
  platformFees: number;
  finalTotal: number;
}

export interface CouponSnapshot {
  couponId: string;
  couponCode: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  description: string;
}

export interface FreeProduct {
  productId: string;
  productSnapshot: {
    name: string;
    brand: string;
    productImages: string[];
    weight: string;
  };
  quantity: number;
  originalPrice: number;
}

export interface Invoice {
  invoiceType: string;
  value: string;
}

export interface TrackingInfo {
  trackingId: string;
  carrier: string;
  estimatedDelivery: string;
  deliveredAt?: string;
}

export interface UpdateOrderStatusRequest {
  _id: string;
  orderStatus: number;
  adminNotes?: string;
}

export interface UpdateTrackingInfoRequest {
  _id: string;
  trackingInfo: TrackingInfo;
}