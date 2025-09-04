import { apiPaths } from "../api-service/apiPaths"
import ApiService from "../api-service/ApiService"

export const getProducts = (params:Params) =>{
    return ApiService({
        method: 'GET',
        endpoint:apiPaths.product.all,
        params
    })
}

export const getProductById = (id:string | number) =>{
    return ApiService({
        method: 'GET',
        endpoint:`${apiPaths.product.all}/${id}`,
    })
}

export const createProduct = (data: any) =>{
    return ApiService({
        method: 'POST',
        endpoint:apiPaths.product.all,
        data
    })
}

export const updateProduct = (id:string | number, data: any) =>{
    return ApiService({
        method: 'PUT',
        endpoint:`${apiPaths.product.all}/${id}`,
        data
    })
}

export const deleteProduct = (id:string | number) =>{
    return ApiService({
        method: 'DELETE',
        endpoint:`${apiPaths.product.all}/${id}`,
    })
}
