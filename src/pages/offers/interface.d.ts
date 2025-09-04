export interface Offer {
  _id: string;
  offerName?: string;
  offerDesc?: string;
  termsAndConditions?: string[];
  highlights?: string[];
  couponCode: string;
  startDateTime?: string;
  expiryDateTime?: string;
  isActive?: boolean;
  discountType?: 'percentage' | 'amount';
  uptoAmountLimit?: number;
  value?: number;
  discountedItemsType: 'totalCartValue' | 'category' | 'allItems' | 'products' | 'buyXGetX';
  minCartValue?: number;
  products?: string[];
  limit?: number;
  userType?: 'all' | 'new';
  isPrivate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferRequest {
  offerName?: string;
  offerDesc?: string;
  termsAndConditions?: string[];
  highlights?: string[];
  couponCode: string;
  startDateTime?: string;
  expiryDateTime?: string;
  isActive?: boolean;
  discountType?: 'percentage' | 'amount';
  uptoAmountLimit?: number;
  value?: number;
  discountedItemsType: 'allItems' | 'totalCartValue';
  minCartValue?: number;
  products?: string[];
  limit?: number;
  isPrivate?: boolean;
}

export interface UpdateOfferRequest extends Partial<CreateOfferRequest> {
  offerId?: string;
}