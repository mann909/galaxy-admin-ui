import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

export const getUsers = (params?: Params) => {
    return ApiService({
        method: 'GET',
        endpoint: apiPaths.user.all,
        params
    });
};