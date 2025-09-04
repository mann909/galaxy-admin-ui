import axios, { AxiosRequestConfig, AxiosInstance, ResponseType } from "axios";

/**
 * Add Base URL
 */
const API_BASE_URL: string | undefined = import.meta.env.VITE_BACKEND_URL ;


/**
 * Interface for defining the properties required for making an API service request
 * @interface ApiServiceProps
 */
interface ApiServiceProps {
  method: string;
  endpoint: string;
  headers?: Record<string, string>;
  data?: any;
  params?:any;
  responseType?:ResponseType;
}

/**
 * Function to create an Axios instance with interceptors
 * @returns AxiosInstance
 */
const createApiInstance = (): AxiosInstance => {
  const api = axios.create();

  api.interceptors.request.use((config) => {
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Response Error:", error);
      return Promise.reject(error);
    }
  );

  return api;
};

/**
 * Function to make API requests using Axios
 * @param method The HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param endpoint The API endpoint
 * @param headers Additional headers for the request
 * @param data Data to be sent with the request (for POST and PUT requests)
 * @returns A Promise that resolves with the API response data
 */
const ApiService = async ({ method, endpoint, headers = {}, data = undefined, params=undefined,responseType }: ApiServiceProps) => {
  
  let baseUrl = API_BASE_URL;

  const axiosConfig: AxiosRequestConfig = {
    method,
    url: `${baseUrl}/${endpoint}`,
    withCredentials: true,
    headers: {
      ...headers,
    },
    data,
    params,
    responseType : responseType ?? undefined
  };

  // console.log(JSON.stringify(axiosConfig.data));
  // console.log(axiosConfig);

  const api = createApiInstance();

  // eslint-disable-next-line no-useless-catch
  try {
    const response = await api(axiosConfig);
    return response;
  } catch (error) {
    throw error;
  }
};

export default ApiService;