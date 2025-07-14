import React, { useEffect, useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme as antdTheme, Spin, Space } from "antd";
import { I18nextProvider } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import dayjs from 'dayjs';

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

// Theme Configuration for Ant Design
const createAntdTheme = (themeMode) => {
  return {
    algorithm: themeMode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: "#6E45E2",
      colorSuccess: "#88D3CE", 
      fontFamily: "'Inter', sans-serif",
      borderRadius: 8,
      wireframe: false,
    },
    components: {
      Button: {
        paddingInline: 16,
        paddingBlock: 8,
        borderRadius: 8,
      },
      Card: {
        borderRadius: 12,
      },
      Layout: {
        colorBgContainer: themeMode === "dark" ? "#1e1e1e" : "#ffffff",
        colorBgBody: themeMode === "dark" ? "#121212" : "#f5f5f5",
      },
    },
  };
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #6E45E2 0%, #88D3CE 100%)",
        }}
      >
        {children}
      </div>
    </motion.div>
  </AnimatePresence>
);

const AppThemeWrapper = ({ children }) => {
  const { themeMode } = useTheme();
  return (
    <ConfigProvider theme={createAntdTheme(themeMode)}>
      {children}
    </ConfigProvider>
  );
};

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Space direction="vertical" align="center">
          <Spin size="large" />
        </Space>
      </div>
    );
  }

  const routes = [
    { path: "/", element: <HomeScreen />, protected: true },
    { path: "/dashboard", element: <DashboardScreen />, protected: true },
    { path: "/item/:id", element: <ItemDetailScreen />, protected: true },
    { path: "/profile", element: <ProfileScreen />, protected: true },
    { path: "/orders", element: <OrderScreen />, protected: true },
    { path: "/contacts", element: <ContactsScreen />, protected: true },
    { path: "/analytics", element: <AnalyticsScreen />, protected: true },
    { path: "/settings", element: <SettingsScreen />, protected: true },
    { path: "/settings/backup", element: <BackupSettings />, protected: true },
    { path: "/settings/security", element: <SecuritySettings />, protected: true },
    { path: "/settings/appearance", element: <AppearanceSettings />, protected: true },
    { path: "/settings/language", element: <LanguageSettings />, protected: true },
    { path: "/inventory-pro", element: <InventoryProIconCard />, protected: true },
    { path: "/khata", element: <KhataBook />, protected: true },
    { path: "/auth", element: <AuthPage />, protected: false },
  ];

  const renderRoute = (route) => {
    if (route.protected) {
      return user ? (
        <ProtectedLayout>
          <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}><Spin size="large" /></div>}>
            {route.element}
          </Suspense>
        </ProtectedLayout>
      ) : (
        <Navigate to="/auth" replace />
      );
    } else {
      return user ? (
        <Navigate to="/" replace />
      ) : (
        <AuthWrapper>
          <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}><Spin size="large" /></div>}>
            {route.element}
          </Suspense>
        </AuthWrapper>
      );
    }
  };

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} path={route.path} element={renderRoute(route)} />
      ))}
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppThemeWrapper>
          <I18nextProvider i18n={i18n}>
            <AuthProvider>
              <ItemProvider>
                <InventoryProvider>
                  <ContactsProvider>
                    <BrowserRouter>
                      <AppContent />
                    </BrowserRouter>
                  </ContactsProvider>
                </InventoryProvider>
              </ItemProvider>
            </AuthProvider>
          </I18nextProvider>
        </AppThemeWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
