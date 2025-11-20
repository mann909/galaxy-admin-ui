import { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { useVerifyTokensApi } from "./api/api-hooks/useAuthApi";
import { resetAuthState, setIsLoggedIn, setUser } from "./store/userSlice";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
// import Users from "./pages/Users/Users";
import Products from "./pages/products/Products";
import Banners from "./pages/banners/Banners";
import Categories from "./pages/categories/Categories";
import Orders from "./pages/orders/Orders";
import Offers from "./pages/offers/Offers";
import { RootState } from "./store/appStore";

interface Route {
  path: string;
  element: ReactElement;
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const publicRoutes: Route[] = [
  { path: "/login", element: <Login /> },
];

const privateRoutes: Route[] = [
  { path: "/", element: <Dashboard /> },
  // { path: "/users", element: <Users /> },
  { path: "/products", element: <Products /> },
  { path: "/banners", element: <Banners /> },
  { path: "/categories", element: <Categories /> },
  { path: "/orders", element: <Orders /> },
  { path: "/offers", element: <Offers /> },
];

// Loading component
const LoadingScreen = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    height="100vh"
    bgcolor="background.default"
  >
    <CircularProgress size={60} />
  </Box>
);

// Main app content
function AppContent() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  // const userInfo = useSelector((state: RootState) => state.user.userInfo);

  // Token verification
  const {
    data: verifyData,
    isLoading: isVerifying,
    isSuccess: isVerifySuccess,
    isError: isVerifyError,
  } = useVerifyTokensApi();

  // Handle authentication state changes
  useEffect(() => {
    if (verifyData && verifyData.data.response) {
      // const userData = verifyData?.data.response;
      // console.log("Token verification successful, user data:", userData);

      // if (userInfo !== userData) {
      //   console.log("User info changed, syncing...");
      //   dispatch(setUser(userData));
      // }

      dispatch(setIsLoggedIn(true));
    } else if (isVerifyError) {
      console.log("Token verification failed, setting user as logged out");
      dispatch(resetAuthState());
    }
  }, [isVerifySuccess, isVerifyError, verifyData, dispatch]);

  // Show loading screen while verifying tokens
  if (isVerifying) {
    console.log("Verifying tokens...");
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public routes - show when user is NOT logged in */}
      {!isLoggedIn &&
        publicRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.element}
          />
        ))}

      {/* Private routes - show when user is logged in */}
      {isLoggedIn &&
        privateRoutes.map((route, index) => (
          <Route
            key={index + publicRoutes.length}
            path={route.path}
            element={route.element}
          />
        ))}

      {/* Default redirect based on user state */}
      <Route
        path="*"
        element={
          <Navigate
            to={!isLoggedIn ? "/login" : "/"}
            replace
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
