import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

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

export const getBanners = (params?: Params) => {
    return ApiService({
        method: 'GET',
        endpoint: apiPaths.banner.all,
        params
    });
};

export const getBannerById = (id: string) => {
    return ApiService({
        method: 'GET',
        endpoint: `${apiPaths.banner.all}/${id}`,
    });
};

export const createBanner = (data: CreateBannerRequest) => {
    return ApiService({
        method: 'POST',
        endpoint: apiPaths.banner.all,
        data
    });
};

export const updateBanner = (data: UpdateBannerRequest) => {
    return ApiService({
        method: 'PUT',
        endpoint: `${apiPaths.banner.all}/${data._id}`,
        data
    });
};

export const deleteBanner = (id: string) => {
    return ApiService({
        method: 'DELETE',
        endpoint: `${apiPaths.banner.all}/${id}`,
    });
};