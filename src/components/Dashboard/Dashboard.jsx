import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  onSnapshot,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Button,
  useTheme,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  useMediaQuery,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ChartIcon,
  DateRange as DateRangeIcon,
  AdminPanelSettings,
  MonetizationOn as ProfitIcon,
  CloudOff as OfflineIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import moment from "moment/moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { db, auth } from "../../firebase/firebaseConfig";
import DashboardHeader from "./DashboardHeader";
import MetricsCards from "./MetricsCards";
import InventorySummary from "./InventorySummary";
import LowStockModal from "./LowStockModal";
import OutOfStockModal from "./OutOfStockModal";
import TopSellingModal from "./TopSellingModal";
import NotificationsModal from "./NotificationsModal";
import { useAuth } from "../Auth/AuthContext";
import MobileAppBar from "../Profile/MobileApp/MobileAppBar";
import MobileDrawer from "../Profile/MobileApp/MobileDrawer";
import AdminTools from "../Profile/AdminTools/AdminTools";
import MobileBottomNav from "../Profile/MobileApp/MobileBottomNav";
import { useItems } from "../../context/ItemContext";

const ADMIN_CREDENTIALS = {
  email: "admin@inventory.com",
  password: "Admin@123",
};

// iOS detection utility
const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

const DashboardScreen = () => {
  const [notificationFilter, setNotificationFilter] = useState("all");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { currentUser, switchUser } = useAuth();
  const { items, loading: itemsLoading } = useItems();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineDataAvailable, setOfflineDataAvailable] = useState(false);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Dashboard state
  const [showTopSellingModal, setShowTopSellingModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [lowStockModalVisible, setLowStockModalVisible] = useState(false);
  const [outOfStockModalVisible, setOutOfStockModalVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState("this_month");
  const [customStartDate, setCustomStartDate] = useState(
    moment().startOf("month")
  );
  const [customEndDate, setCustomEndDate] = useState(moment().endOf("day"));
  const [lastMonthChecked, setLastMonthChecked] = useState(moment().month());
  const [showCustomDateDialog, setShowCustomDateDialog] = useState(false);
  const [profitData, setProfitData] = useState([]);

  // Profile state
  const [userData, setUserData] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Check if app is running in standalone mode (PWA)
  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  // Enable Firestore offline persistence with iOS consideration
  useEffect(() => {
    const enablePersistence = async () => {
      try {
        if (!isIOS()) {
          // iOS has limitations with IndexedDB
          await enableIndexedDbPersistence(db);
          console.log("Offline persistence enabled");
        }
      } catch (err) {
        console.error("Persistence error:", err);
      }
    };

    enablePersistence();
  }, []);

  // Network status listener with iOS-specific handling
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);

      // iOS often needs a hard refresh when coming back online
      if (isIOS() && !isStandalone) {
        window.location.reload();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isStandalone]);

  // Check for cached data with iOS limitations in mind
  useEffect(() => {
    const checkCachedData = async () => {
      try {
        if ("caches" in window) {
          const cache = await caches.open("inventory-data-v1");
          const keys = await cache.keys();
          setOfflineDataAvailable(keys.length > 0);
        }
      } catch (err) {
        console.error("Cache check failed:", err);
      }
    };

    if (!isOnline) {
      checkCachedData();
    }
  }, [isOnline]);

  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    return (
      currentUser.email === ADMIN_CREDENTIALS.email ||
      userData?.role === "admin" ||
      userData?.isAdmin
    );
  }, [currentUser, userData]);

  // Filter items for current user
  const userItems = useMemo(() => {
    if (!currentUser) return [];
    return items.filter((item) => item.userId === currentUser.uid);
  }, [items, currentUser]);

  // Calculate inventory metrics including profit
  const inventoryData = useMemo(() => {
    let totalItems = 0;
    let totalValue = 0;
    let totalCostValue = 0;
    let totalPotentialProfit = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    const lowStockProducts = [];
    const outOfStockProducts = [];

    userItems.forEach((item) => {
      totalItems++;
      const quantity = parseInt(item.quantity) || 1;
      const price = parseFloat(item.price) || 0;
      const costPrice = parseFloat(item.costPrice) || 0;

      totalValue += price * quantity;
      totalCostValue += costPrice * quantity;
      totalPotentialProfit += (price - costPrice) * quantity;

      if (item.quantity <= 0) {
        outOfStockItems++;
        outOfStockProducts.push(item);
      } else if (item.quantity <= (item.safetyStock || 10)) {
        lowStockItems++;
        lowStockProducts.push(item);
      }
    });

    return {
      items: userItems,
      totalItems,
      lowStockItems,
      outOfStockItems,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      totalCostValue,
      totalPotentialProfit,
      profitMargin:
        totalValue > 0 ? ((totalValue - totalCostValue) / totalValue) * 100 : 0,
    };
  }, [userItems]);

  // Prepare profit data for the chart
  const prepareProfitData = useCallback((items) => {
    const profitByCategory = {};

    items.forEach((item) => {
      const category = item.category || "Uncategorized";
      const quantity = parseInt(item.quantity) || 1;
      const price = parseFloat(item.price) || 0;
      const costPrice = parseFloat(item.costPrice) || 0;
      const profit = (price - costPrice) * quantity;

      if (!profitByCategory[category]) {
        profitByCategory[category] = {
          category,
          profit: 0,
          cost: 0,
          revenue: 0,
          count: 0,
        };
      }

      profitByCategory[category].profit += profit;
      profitByCategory[category].cost += costPrice * quantity;
      profitByCategory[category].revenue += price * quantity;
      profitByCategory[category].count += 1;
    });

    return Object.values(profitByCategory)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, []);

  useEffect(() => {
    if (userItems.length > 0) {
      setProfitData(prepareProfitData(userItems));
    }
  }, [userItems, prepareProfitData]);

  const handleReturnToAdmin = async () => {
    try {
      await switchUser(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    } catch (error) {
      console.error("Error returning to admin:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.email === ADMIN_CREDENTIALS.email) {
      const adminData = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: "Admin",
        photoURL: currentUser.photoURL,
        role: "admin",
        isAdmin: true,
        createdAt: new Date(),
      };
      setUserData(adminData);
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData({
          ...data,
          isAdmin:
            data.role === "admin" || data.email === ADMIN_CREDENTIALS.email,
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  // Fetch top selling items for current user only
  const { data: topSellingItems = [], isLoading: loadingSalesData } = useQuery({
    queryKey: [
      "topSelling",
      selectedRange,
      currentUser?.uid,
      customStartDate,
      customEndDate,
    ],
    queryFn: async () => {
      // query function (same as before)
      if (!currentUser) return [];

      const { startDate, endDate } = getDateRange(selectedRange);

      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", currentUser.uid),
        where("date", ">=", startDate),
        where("date", "<=", endDate),
        orderBy("date", "desc")
      );
      const ordersSnapshot = await getDocs(ordersQuery);

      const itemSales = {};
      ordersSnapshot.forEach((doc) => {
        const order = doc.data();
        order.items?.forEach((item) => {
          if (!itemSales[item.name]) {
            itemSales[item.name] = {
              name: item.name,
              quantity: 0,
              totalSales: 0,
              profit: 0,
            };
          }
          const quantity = parseInt(item.quantity || 0);
          const price = parseFloat(item.price || 0);
          const costPrice = parseFloat(item.costPrice || 0);

          itemSales[item.name].quantity += quantity;
          itemSales[item.name].totalSales += price * quantity;
          itemSales[item.name].profit += (price - costPrice) * quantity;
        });
      });

      return Object.values(itemSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const getDateRange = useCallback(
    (range) => {
      const now = moment();
      let startDate, endDate;

      switch (range) {
        case "today":
          startDate = now.clone().startOf("day").toDate();
          endDate = now.clone().endOf("day").toDate();
          break;
        case "yesterday":
          startDate = now.clone().subtract(1, "day").startOf("day").toDate();
          endDate = now.clone().subtract(1, "day").endOf("day").toDate();
          break;
        case "this_week":
          startDate = now.clone().startOf("week").toDate();
          endDate = now.clone().endOf("week").toDate();
          break;
        case "last_week":
          startDate = now.clone().subtract(1, "week").startOf("week").toDate();
          endDate = now.clone().subtract(1, "week").endOf("week").toDate();
          break;
        case "this_month":
          startDate = now.clone().startOf("month").toDate();
          endDate = now.clone().endOf("month").toDate();
          break;
        case "last_month":
          startDate = now
            .clone()
            .subtract(1, "month")
            .startOf("month")
            .toDate();
          endDate = now.clone().subtract(1, "month").endOf("month").toDate();
          break;
        case "this_year":
          startDate = now.clone().startOf("year").toDate();
          endDate = now.clone().endOf("year").toDate();
          break;
        case "custom":
          startDate = customStartDate.toDate();
          endDate = customEndDate.toDate();
          break;
        default:
          startDate = now.clone().startOf("month").toDate();
          endDate = now.clone().endOf("month").toDate();
      }

      return { startDate, endDate };
    },
    [customStartDate, customEndDate]
  );

  const getRangeTitle = useCallback((range) => {
    switch (range) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "this_week":
        return "This Week";
      case "last_week":
        return "Last Week";
      case "this_month":
        return "This Month";
      case "last_month":
        return "Last Month";
      case "this_year":
        return "This Year";
      case "custom":
        return "Custom Range";
      default:
        return "This Month";
    }
  }, []);

  const handleDateRangeChange = (range) => {
    if (range === "custom") {
      setShowCustomDateDialog(true);
    } else {
      setSelectedRange(range);
    }
  };

  const handleCustomDateSubmit = () => {
    setSelectedRange("custom");
    setShowCustomDateDialog(false);
  };

  const metrics = useMemo(
    () => [
      {
        id: "1",
        title: "Total Items",
        value: itemsLoading
          ? "..."
          : (inventoryData?.totalItems || 0).toLocaleString(),
        icon: <InventoryIcon fontSize="large" />,
        color: theme.palette.success.main,
        onPress: null,
      },
      {
        id: "2",
        title: "Total Value",
        value: itemsLoading
          ? "..."
          : `${(inventoryData?.totalValue || 0).toFixed(2)}`,
        icon: <MoneyIcon fontSize="large" />,
        color: theme.palette.info.main,
        onPress: null,
      },
      {
        id: "3",
        title: "Potential Profit",
        value: itemsLoading
          ? "..."
          : `${(inventoryData?.totalPotentialProfit || 0).toFixed(2)}`,
        icon: <ProfitIcon fontSize="large" />,
        color: theme.palette.success.dark,
        onPress: null,
      },
      {
        id: "4",
        title: "Profit Margin",
        value: itemsLoading
          ? "..."
          : `${(inventoryData?.profitMargin || 0).toFixed(2)}%`,
        icon: <TrendingUpIcon fontSize="large" />,
        color: theme.palette.secondary.main,
        onPress: null,
      },
      {
        id: "5",
        title: "Low Stock",
        value: itemsLoading
          ? "..."
          : (inventoryData?.lowStockItems || 0).toLocaleString(),
        icon: <WarningIcon fontSize="large" />,
        color: theme.palette.warning.main,
        onPress: () => setLowStockModalVisible(true),
      },
      {
        id: "6",
        title: "Out of Stock",
        value: itemsLoading
          ? "..."
          : (inventoryData?.outOfStockItems || 0).toLocaleString(),
        icon: <ErrorIcon fontSize="large" />,
        color: theme.palette.error.main,
        onPress: () => setOutOfStockModalVisible(true),
      },
    ],
    [itemsLoading, inventoryData, theme]
  );

  if (!currentUser) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography color="error">
          Please login to access the dashboard
        </Typography>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* iOS-specific status bar spacer */}
      {isIOS() && isStandalone && (
        <Box
          sx={{
            height: "env(safe-area-inset-top)",
            bgcolor: theme.palette.primary.main,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
          }}
        />
      )}

      {currentUser && currentUser.email !== ADMIN_CREDENTIALS.email && (
        <Button
          variant="contained"
          onClick={handleReturnToAdmin}
          startIcon={<AdminPanelSettings />}
          sx={{
            position: "fixed",
            bottom: isMobile
              ? isIOS()
                ? "calc(80px + env(safe-area-inset-bottom))"
                : 80
              : 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          Return to Admin
        </Button>
      )}

      {/* Offline Status Indicator */}
      {!isOnline && (
        <Box
          sx={{
            position: "fixed",
            top: isIOS() && isStandalone ? "env(safe-area-inset-top)" : 0,
            left: 0,
            right: 0,
            bgcolor: theme.palette.warning.main,
            color: "white",
            p: 1,
            textAlign: "center",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <OfflineIcon sx={{ mr: 1 }} />
          <Typography variant="body2">
            You are currently offline. Some data may not be up to date.
          </Typography>
        </Box>
      )}

      {/* Offline Data Available Alert */}
      <Snackbar
        open={showOfflineAlert && offlineDataAvailable}
        autoHideDuration={6000}
        onClose={() => setShowOfflineAlert(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          bottom: isIOS()
            ? "calc(80px + env(safe-area-inset-bottom))"
            : undefined,
        }}
      >
        <Alert
          severity="info"
          icon={<OfflineIcon />}
          onClose={() => setShowOfflineAlert(false)}
        >
          Using cached data. Some information may not be up to date.
        </Alert>
      </Snackbar>

      <Box
        sx={{
          p: isMobile ? 0 : 3,
          pb: isMobile
            ? isIOS()
              ? "calc(80px + env(safe-area-inset-bottom))"
              : "80px"
            : 3,
          bgcolor: "background.default",
          minHeight: isIOS() ? "-webkit-fill-available" : "100vh",
          color: "text.primary",
          paddingTop:
            isIOS() && isStandalone
              ? "calc(env(safe-area-inset-top) + 8px)"
              : undefined,
          paddingBottom:
            isIOS() && isStandalone ? "env(safe-area-inset-bottom)" : undefined,
        }}
      >
        {isMobile && (
          <MobileAppBar
            toggleDrawer={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            userData={userData}
            isIOS={isIOS()}
          />
        )}

        <MobileDrawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          userData={userData}
          isAdmin={isAdmin}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 3,
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: activeTab === 0 ? "block" : isMobile ? "none" : "block",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DashboardHeader
                setShowNotificationsModal={setShowNotificationsModal}
                lowStockCount={inventoryData?.lowStockItems || 0}
                outOfStockCount={inventoryData?.outOfStockItems || 0}
                isOnline={isOnline}
                isIOS={isIOS()}
              />

              {itemsLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* Value Summary Cards */}
                  <Grid container spacing={3} sx={{ mb: 3, mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          bgcolor: theme.palette.primary.dark,
                          color: "white",
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                Total Inventory Value
                              </Typography>
                              <Typography variant="h4" fontWeight="bold">
                                {(inventoryData?.totalValue || 0).toFixed(2)}
                              </Typography>
                              <Typography variant="body2">
                                Across {inventoryData?.totalItems || 0} items
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                p: 2,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ChartIcon sx={{ fontSize: 40 }} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          bgcolor: theme.palette.success.dark,
                          color: "white",
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                Potential Profit
                              </Typography>
                              <Typography variant="h4" fontWeight="bold">
                                {(
                                  inventoryData?.totalPotentialProfit || 0
                                ).toFixed(2)}
                              </Typography>
                              <Typography variant="body2">
                                {inventoryData?.profitMargin?.toFixed(2) || 0}%
                                Profit Margin
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                p: 2,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ProfitIcon sx={{ fontSize: 40 }} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <MetricsCards metrics={metrics} />

                  <InventorySummary
                    loading={itemsLoading}
                    totalItems={inventoryData?.totalItems || 0}
                    totalValue={inventoryData?.totalValue || 0}
                    totalProfit={inventoryData?.totalPotentialProfit || 0}
                    profitMargin={inventoryData?.profitMargin || 0}
                    items={inventoryData?.items || []}
                    isOnline={isOnline}
                    isIOS={isIOS()}
                  />
                </>
              )}

              <LowStockModal
                open={lowStockModalVisible}
                onClose={() => setLowStockModalVisible(false)}
                lowStockItems={inventoryData?.lowStockItems || 0}
                lowStockProducts={inventoryData?.lowStockProducts || []}
                isIOS={isIOS()}
              />

              <OutOfStockModal
                open={outOfStockModalVisible}
                onClose={() => setOutOfStockModalVisible(false)}
                outOfStockItems={inventoryData?.outOfStockItems || 0}
                outOfStockProducts={inventoryData?.outOfStockProducts || []}
                isIOS={isIOS()}
              />

              <TopSellingModal
                open={showTopSellingModal}
                onClose={() => setShowTopSellingModal(false)}
                selectedRange={selectedRange}
                handleDateRangeChange={handleDateRangeChange}
                getRangeTitle={getRangeTitle}
                loading={loadingSalesData}
                topSellingItems={topSellingItems || []}
                isOnline={isOnline}
                isIOS={isIOS()}
              />

              <NotificationsModal
                open={showNotificationsModal}
                onClose={() => setShowNotificationsModal(false)}
                lowStockItems={inventoryData?.lowStockProducts || []}
                outOfStockItems={inventoryData?.outOfStockProducts || []}
                filter={notificationFilter}
                isIOS={isIOS()}
              />

              <LocalizationProvider dateAdapter={AdapterMoment}>
                <Dialog
                  open={showCustomDateDialog}
                  onClose={() => setShowCustomDateDialog(false)}
                  fullScreen={isIOS() && isMobile}
                >
                  <DialogTitle>Select Custom Date Range</DialogTitle>
                  <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                      <Box
                        display="flex"
                        gap={2}
                        mt={1}
                        flexDirection={isMobile ? "column" : "row"}
                      >
                        <DatePicker
                          label="Start Date"
                          value={customStartDate}
                          onChange={(newValue) => setCustomStartDate(newValue)}
                          renderInput={(params) => (
                            <TextField fullWidth {...params} />
                          )}
                        />
                        <DatePicker
                          label="End Date"
                          value={customEndDate}
                          onChange={(newValue) => setCustomEndDate(newValue)}
                          renderInput={(params) => (
                            <TextField fullWidth {...params} />
                          )}
                        />
                      </Box>
                    </LocalizationProvider>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setShowCustomDateDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleCustomDateSubmit}
                    >
                      Apply
                    </Button>
                  </DialogActions>
                </Dialog>
              </LocalizationProvider>
            </motion.div>
          </Box>

          {isAdmin && (
            <Box
              sx={{
                flex: isMobile ? 1 : 0.5,
                minWidth: isMobile ? "100%" : 350,
                display:
                  activeTab === 1 ? "block" : isMobile ? "none" : "block",
              }}
            >
              <AdminTools
                userData={userData}
                isOnline={isOnline}
                isIOS={isIOS()}
              />
            </Box>
          )}
        </Box>

        {isMobile && (
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
            isIOS={isIOS()}
          />
        )}
      </Box>
    </>
  );
};

export default DashboardScreen;
