import { Category } from "../categories/interface";

export interface ProductVariantSize {
  name: string;
  code: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  capacity?: string;
  weight?: number;
}

export interface ProductVariantColor {
  name: string;
  code: string;
  hexCode?: string;
  images: string[];
}

export interface ProductVariantPricing {
  basePrice: number;
  salePrice?: number;
  currency: string;
  costPrice?: number;
  marginPercentage?: number;
}

export interface ProductVariantInventory {
  stock: number;
  lowStockThreshold: number;
  reservedStock: number;
}

export interface ProductVariant {
  _id?: string;
  sku: string;
  size: ProductVariantSize;
  color: ProductVariantColor;
  pricing: ProductVariantPricing;
  inventory: ProductVariantInventory;
  isActive: boolean;
  displayOrder: number;
}

export interface ProductTypeSpecific {
  // For Backpacks
  laptopCompatibility?: string;
  compartments?: number;
  hasWaterBottleHolder?: boolean;
  
  // For Luggage
  wheelType?: string;
  lockType?: string;
  isExpandable?: boolean;
  
  // For Bags
  closureType?: string;
  handleType?: string;
  strapType?: string;
}

export interface ComboOfferIncludedSize {
  sizeCode: string;
  quantity: number;
}

export interface ComboOffer {
  _id?: string;
  name: string;
  description?: string;
  includedSizes: ComboOfferIncludedSize[];
  comboPrice: number;
  savings?: number;
  savingsPercentage?: number;
  displayOrder: number;
  badgeText?: string;
  isActive: boolean;
}

export interface ProductAnalytics {
  views: number;
  purchases: number;
  wishlistCount: number;
}

export interface ProductRating {
  average: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: Category | null;
  productType: 'bag' | 'backpack' | 'luggage';
  features: string[];
  materials: string[];
  typeSpecific?: ProductTypeSpecific;
  variants: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  analytics: ProductAnalytics;
  rating: ProductRating;
  status: 'active' | 'inactive' | 'out-of-stock' | 'discontinued';
  createdBy?: string;
  adminNotes?: string;
  comboOffers: ComboOffer[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductsResponse {
  docs: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  productType: 'bag' | 'backpack' | 'luggage';
  features?: string[];
  materials?: string[];
  typeSpecific?: ProductTypeSpecific;
  variants: Omit<ProductVariant, '_id'>[];
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  status?: 'active' | 'inactive' | 'out-of-stock' | 'discontinued';
  adminNotes?: string;
  comboOffers?: Omit<ComboOffer, '_id'>[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  _id: string;
}