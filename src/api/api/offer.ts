import { CreateOfferRequest, UpdateOfferRequest } from "../../pages/offers/interface";
import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

export const getOffers = (params?: Params) => {
    return ApiService({
        method: 'GET',
        endpoint: apiPaths.offer.all,
        params
    });
};

export const getOfferById = (id: string) => {
    return ApiService({
        method: 'GET',
        endpoint: `${apiPaths.offer.all}/${id}`,
    });
};

export const createOffer = (data: CreateOfferRequest) => {
    return ApiService({
        method: 'POST',
        endpoint: apiPaths.offer.all,
        data
    });
};

export const updateOffer = (id: string, data: UpdateOfferRequest) => {
    return ApiService({
        method: 'PUT',
        endpoint: `${apiPaths.offer.all}/${id}`,
        data
    });
};

export const deleteOffer = (id: string) => {
    return ApiService({
        method: 'DELETE',
        endpoint: `${apiPaths.offer.all}/${id}`,
    });
};