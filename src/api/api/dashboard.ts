import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

export const getDashboardStats = () => {
    return ApiService({
        method: 'GET',
        endpoint: apiPaths.dashboard.stats,
    });
};