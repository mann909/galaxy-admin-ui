import { CreateCategoryRequest } from "../../pages/categories/interface";
import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

export const getCategories = (params?: Params) => {
    return ApiService({
        method: 'GET',
        endpoint: apiPaths.category.all,
        params
    });
};

export const getCategoryById = (id: string) => {
    return ApiService({
        method: 'GET',
        endpoint: `${apiPaths.category.all}/${id}`,
    });
};

export const createCategory = (data: CreateCategoryRequest) => {
    return ApiService({
        method: 'POST',
        endpoint: apiPaths.category.all,
        data
    });
};

export const updateCategory = (id: string, data: Partial<CreateCategoryRequest>) => {
    return ApiService({
        method: 'PUT',
        endpoint: `${apiPaths.category.all}/${id}`,
        data
    });
};

export const deleteCategory = (id: string) => {
    return ApiService({
        method: 'DELETE',
        endpoint: `${apiPaths.category.all}/${id}`,
    });
};
