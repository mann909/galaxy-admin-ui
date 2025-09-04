/**
 * API paths for various CRUD operations
 */
interface SubEndPoints {
    [key: string]: string;
}

interface ApiPaths {
    [key: string]: SubEndPoints;
}

export const apiPaths: ApiPaths = {
    auth:{
        login:"auth/login",
        verifyTokens: "auth/verify-tokens",
        logout: "auth/logout",
    },
    category:{
        all:"category",
    },
    product:{
        all:"product",
    },
    upload:{
        upload:"upload"
    },
    banner:{
        all:"banner",
    },
    order:{
        all:"order",
    },
    offer:{
        all:"offer",
    },
    dashboard:{
        stats:"dashboard/stats",
    }
};
