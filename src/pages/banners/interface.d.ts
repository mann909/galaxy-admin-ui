export interface Banner {
  _id: string;
  bannerImages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerRequest {
  bannerImages: string[];
}

export interface UpdateBannerRequest {
  _id: string;
  bannerImages: string[];
}