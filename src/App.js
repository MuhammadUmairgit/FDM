import React, { useEffect, useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, CircularProgress } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Context Providers
import app from "./firebase/firebaseConfig";
import { ItemProvider } from "./context/ItemContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider } from "./components/Auth/AuthContext";
import i18n from "./components/Settings/i18n";
import { ContactsProvider } from "./CustomerScreen/ContactsScreen";
import AnimatedDrawer from "./components/Drawer/AnimatedDrawer";
import { InventoryProvider } from "./components/HomeScreen/InventoryContext";

// Lazy-loaded components
const HomeScreen = lazy(() => import("./components/HomeScreen/HomeScreen"));
const DashboardScreen = lazy(() => import("./components/Dashboard/Dashboard"));
const ItemDetailScreen = lazy(() =>
  import("./components/ItemDetail/ItemDetail")
);
const AuthPage = lazy(() => import("./components/Auth/AuthPage"));
const ProfileScreen = lazy(() => import("./components/Profile/ProfileScreen"));
const OrderScreen = lazy(() => import("./components/OrderScreen/OrderScreen"));
const ContactsScreen = lazy(() => import("./CustomerScreen/ContactsScreen"));
const AnalyticsScreen = lazy(() =>
  import("./components/Analytics/AnalyticsScreen")
);
const SettingsScreen = lazy(() => import("./components/Settings/Settings"));
const BackupSettings = lazy(() =>
  import("./components/Settings/BackupSettings")
);
const SecuritySettings = lazy(() =>
  import("./components/Settings/SecuritySettings")
);
const AppearanceSettings = lazy(() =>
  import("./components/Settings/AppearanceSettings")
);
const LanguageSettings = lazy(() =>
  import("./components/Settings/LanguageSettings")
);
const InventoryProIconCard = lazy(() =>
  import("./components/InventoryProIconCard/InventoryProIconCard")
);
const KhataBook = lazy(() => import("./components/KhataBook/KhataBook"));
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Theme Configuration
const createAppTheme = (themeMode) => {
  return createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: "#6E45E2",
      },
      secondary: {
        main: "#88D3CE",
      },
      background: {
        default: themeMode === "dark" ? "#121212" : "#f5f5f5",
        paper: themeMode === "dark" ? "#1e1e1e" : "#ffffff",
      },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "8px 16px",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });
};

// Layout Components
const ProtectedLayout = ({ children }) => {
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <AnimatedDrawer>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </AnimatedDrawer>
  );
};

const AuthWrapper = ({ children }) => (
  <AnimatePresence mode="wait">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #6E45E2 0%, #88D3CE 100%)",
        }}
      >
        {children}
      </Box>
    </motion.div>
  </AnimatePresence>
);

// Route Configuration
const routes = [
  { path: "/", element: <HomeScreen />, protected: true },
  { path: "/pro-icon", element: <InventoryProIconCard />, protected: true },
  { path: "/orders", element: <OrderScreen />, protected: true },
  { path: "/profile", element: <ProfileScreen />, protected: true },
  { path: "/item/:id", element: <ItemDetailScreen />, protected: true },
  { path: "/dashboard", element: <DashboardScreen />, protected: true },
  { path: "/customers", element: <ContactsScreen />, protected: true },
  { path: "/analytics", element: <AnalyticsScreen />, protected: true },
  { path: "/settings", element: <SettingsScreen />, protected: true },
  {
    path: "/settings/appearance",
    element: <AppearanceSettings />,
    protected: true,
  },
  {
    path: "/settings/language",
    element: <LanguageSettings />,
    protected: true,
  },
  {
    path: "/settings/security",
    element: <SecuritySettings />,
    protected: true,
  },
  { path: "/settings/backup", element: <BackupSettings />, protected: true },
  { path: "/khata", element: <KhataBook />, protected: true },
  { path: "/auth", element: <AuthPage />, protected: false },
];

const AppThemeWrapper = ({ children }) => {
  const { themeMode } = useTheme();
  const theme = React.useMemo(() => createAppTheme(themeMode), [themeMode]);

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, [auth]);

  if (!authChecked) {
    return (
      <Suspense
        fallback={
          <Box
            sx={{
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        }
      />
    );
  }

  const renderRoute = (route) => {
    if (route.protected) {
      return (
        <Route
          key={route.path}
          path={route.path}
          element={
            user ? (
              <ProtectedLayout>
                <Suspense fallback={<CircularProgress />}>
                  {route.element}
                </Suspense>
              </ProtectedLayout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
      );
    }
    return (
      <Route
        key={route.path}
        path={route.path}
        element={
          user ? (
            <Navigate to="/" />
          ) : (
            <AuthWrapper>
              <Suspense fallback={<CircularProgress />}>
                {route.element}
              </Suspense>
            </AuthWrapper>
          )
        }
      />
    );
  };

  return (
    <>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={3000}
      >
        <ItemProvider>
          <Routes>
            {routes.map(renderRoute)}
            <Route path="*" element={<Navigate to={user ? "/" : "/auth"} />} />
          </Routes>
        </ItemProvider>
      </SnackbarProvider>
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {" "}
          {/* ✅ AuthProvider must come first */}
          <InventoryProvider>
            <I18nextProvider i18n={i18n}>
              <ContactsProvider>
                {/* <StorageProvider> */}
                <ThemeProvider>
                  <AppThemeWrapper>
                    <AppContent />
                  </AppThemeWrapper>
                </ThemeProvider>
                {/* </StorageProvider> */}
                {/* <ReactQueryDevtools initialIsOpen={false} /> */}
              </ContactsProvider>
            </I18nextProvider>
          </InventoryProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
