import { apiPaths } from "../api-service/apiPaths"
import ApiService from "../api-service/ApiService"


export const verifyTokens = () =>{
    return ApiService({
        method: 'GET',
        endpoint:apiPaths.auth.verifyTokens,
    })
}

export const login = (data:any) =>{
    return ApiService({
        method: 'POST',
        endpoint:apiPaths.auth.login,
        data
    })
}

export const logout = ()=>{
    return ApiService({
        method: 'DELETE',
        endpoint:apiPaths.auth.logout,
    })
}

// Change password
// export const changePassword = (data: {oldPassword:string, newPassword:string, confirmPassword:string})=>{
//     return ApiService({
//         method: 'POST',
//         endpoint:apiPaths.auth.changePassword,
//         data
//     })
// }
