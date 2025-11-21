
export const apiPaths = {
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
    },
    user:{
        all:"user",
    }
} as const;
