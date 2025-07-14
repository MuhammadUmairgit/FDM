import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Fab,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Menu as MenuIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material";
import { format } from "date-fns/format";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import MobileMenuDrawer from "./MobileMenuDrawer";
import OrderForm from "./OrderForm";
import OrderHistory from "./OrderHistory";
import FilterDialog from "./FilterDialog";
import ReceiptModal from "./ReceiptModal";
import ShareMenu from "./ShareMenu";
import NotificationBell from "./NotificationBell";
import { useEffect, useMemo, useRef, useState } from "react";

const OrderScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const [orderItems, setOrderItems] = useState([
    { name: "", quantity: "", price: "", available: 0, id: Date.now() },
  ]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptItems, setReceiptItems] = useState([]);
  const [selectedPastOrder, setSelectedPastOrder] = useState(null);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [dateFilter, setDateFilter] = useState("current");
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date(new Date().setDate(1)),
    end: new Date(),
  });
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(1);
  const receiptRef = useRef(null);
  const [savedOrders, setSavedOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const notificationInterval = setInterval(() => {
      if (savedOrders.length > 0) {
        const newNotification = {
          id: Date.now(),
          message: `You have ${savedOrders.length} saved orders pending`,
          timestamp: new Date(),
          read: false,
        };
        setNotifications((prev) => [...prev, newNotification]);
        setNotificationCount((prev) => prev + 1);

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Pending Orders", {
            body: newNotification.message,
          });
        }
      }
    }, 3600000);

    return () => clearInterval(notificationInterval);
  }, [savedOrders]);

  const saveToCart = async () => {
    if (!selectedContact) {
      setSnackbar({
        open: true,
        message: "Please select a customer",
        severity: "error",
      });
      return;
    }

    const validItems = orderItems.filter(
      (item) => item.name && item.quantity && item.price
    );

    if (validItems.length === 0) {
      setSnackbar({
        open: true,
        message: "Please add at least one valid item to the order",
        severity: "error",
      });
      return;
    }

    try {
      const orderData = {
        contactId: selectedContact.id,
        contactName: selectedContact.name || "Unknown Customer",
        items: validItems.map((item) => ({
          name: item.name || "Unnamed Item",
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 0,
        })),
        total: parseFloat(
          validItems
            .reduce(
              (sum, item) =>
                sum +
                parseFloat(item.price || 0) * parseInt(item.quantity || 0),
              0
            )
            .toFixed(2)
        ),
        date: serverTimestamp(),
        status: "saved",
      };

      const docRef = doc(collection(db, "savedOrders"));
      await setDoc(docRef, orderData);

      setSavedOrders((prev) => [...prev, orderData]);
      setNotificationCount((prev) => prev + 1);

      const newNotification = {
        id: Date.now(),
        message: `Order saved for ${selectedContact.name || "customer"}`,
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [...prev, newNotification]);

      setSnackbar({
        open: true,
        message: "Order saved to cart!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error saving order",
        severity: "error",
      });
    }
  };

  const showMobileNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (
      "Notification" in window &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  };

  const updateInventory = async (orderItems) => {
    const batch = writeBatch(db);
    const inventorySnapshot = await getDocs(collection(db, "inventory"));

    orderItems.forEach((orderItem) => {
      const inventoryItem = inventorySnapshot.docs.find(
        (doc) =>
          (doc.data().name || "").toLowerCase() ===
          (orderItem.name || "").toLowerCase()
      );

      if (inventoryItem) {
        const currentQuantity = inventoryItem.data().quantity || 0;
        const newQuantity = currentQuantity - parseInt(orderItem.quantity || 0);
        const itemRef = doc(db, "inventory", inventoryItem.id);
        batch.update(itemRef, { quantity: Math.max(0, newQuantity) });
      }
    });

    await batch.commit();
  };

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedContact) {
        throw new Error("Please select a customer");
      }

      const validItems = orderItems.filter(
        (item) => item.name && item.quantity && item.price
      );

      if (validItems.length === 0) {
        throw new Error("Please add at least one valid item to the order");
      }

      await updateInventory(validItems);

      const orderData = {
        contactId: selectedContact.id,
        contactName: selectedContact.name || "Unknown Customer",
        items: validItems.map((item) => ({
          name: item.name || "Unnamed Item",
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 0,
        })),
        total: parseFloat(
          validItems
            .reduce(
              (sum, item) =>
                sum +
                parseFloat(item.price || 0) * parseInt(item.quantity || 0),
              0
            )
            .toFixed(2)
        ),
        date: serverTimestamp(),
        status: "completed",
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      return docRef.id;
    },
    onSuccess: (orderId) => {
      setOrderItems([
        { name: "", quantity: "", price: "", available: 0, id: Date.now() },
      ]);
      setSnackbar({
        open: true,
        message: "Order placed successfully!",
        severity: "success",
      });
      setReceiptItems(
        orderItems.filter((item) => item.name && item.quantity && item.price)
      );
      setShowReceipt(true);
      showMobileNotification(
        "Order Placed",
        "Your order has been placed successfully"
      );
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["inventory"]);
      fetchFilteredOrders();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    },
  });

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "inventory"));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().name || doc.data().title || "Untitled Item",
        price: doc.data().price || 0,
        quantity: doc.data().quantity || 0,
      }));
    },
  });

  const fetchFilteredOrders = async () => {
    try {
      let startDate = new Date();
      let endDate = new Date();

      if (dateFilter === "last") {
        startDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
        startDate.setDate(1);
      } else if (dateFilter === "current") {
        startDate = new Date(new Date().setDate(1));
      } else if (dateFilter === "custom") {
        startDate = customDateRange.start;
        endDate = customDateRange.end;
      }

      const ordersQuery = query(
        collection(db, "orders"),
        where("date", ">=", startDate),
        where("date", "<=", endDate)
      );

      const querySnapshot = await getDocs(ordersQuery);
      const orders = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const date = data.date?.toDate ? data.date.toDate() : new Date();
          return {
            id: doc.id,
            contactId: data.contactId || "",
            contactName: data.contactName || "Unknown Customer",
            items: data.items || [],
            total: Number(data.total || 0),
            date: format(date, "MMM dd, yyyy hh:mm a"),
            timestamp: date.getTime(),
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp);

      setFilteredOrders(orders);
    } catch (error) {
      console.error("Error fetching filtered orders:", error);
      setSnackbar({
        open: true,
        message: "Error fetching orders",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchFilteredOrders();
  }, [dateFilter, customDateRange]);

  const handlePastOrderClick = (order) => {
    setSelectedPastOrder(order);
    setReceiptItems(order.items || []);
    setShowReceipt(true);
  };

  const grandTotal = useMemo(() => {
    return orderItems
      .reduce((total, item) => {
        const priceNum = parseFloat(item.price) || 0;
        const quantityNum = parseInt(item.quantity) || 0;
        return total + priceNum * quantityNum;
      }, 0)
      .toFixed(2);
  }, [orderItems]);

  const handleShareClick = (event) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  console.log("selectedContact", selectedContact);

  return (
    <Box
      sx={{
        p: isMobile ? 1 : 3,
        minHeight: "100vh",
        position: "relative",
        pb: isMobile ? "80px" : 0,
      }}
      ref={receiptRef}
    >
      {isMobile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            mb: 2,
            bgcolor: "background.paper",
            boxShadow: 1,
            borderRadius: 2,
          }}
        >
          <IconButton onClick={toggleMobileDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {activeTab === 0 ? "New Order" : "Order History"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <NotificationBell
              count={notificationCount}
              notifications={notifications}
              onClearNotifications={() => {
                setNotificationCount(0);
                setNotifications([]);
              }}
            />
            {activeTab === 1 && (
              <IconButton onClick={toggleFilterDrawer}>
                <FilterIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      )}

      <MobileMenuDrawer
        open={mobileDrawerOpen}
        onClose={toggleMobileDrawer}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pastOrdersCount={filteredOrders.length}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 3,
        }}
      >
        <OrderForm
          activeTab={activeTab}
          isMobile={isMobile}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          orderItems={orderItems}
          setOrderItems={setOrderItems}
          inventory={inventory}
          grandTotal={grandTotal}
          onShareClick={handleShareClick}
          onPlaceOrder={() => placeOrderMutation.mutate()}
          placeOrderMutation={placeOrderMutation}
          dateFilter={dateFilter}
          setShowDateRangeModal={setShowDateRangeModal}
          customDateRange={customDateRange}
          filteredOrders={filteredOrders}
          handlePastOrderClick={handlePastOrderClick}
          onSaveToCart={saveToCart}
        />

        <OrderHistory
          activeTab={activeTab}
          isMobile={isMobile}
          selectedContact={selectedContact}
          filteredOrders={filteredOrders}
          dateFilter={dateFilter}
          customDateRange={customDateRange}
          onOrderClick={handlePastOrderClick}
          onFilterClick={() => setShowDateRangeModal(true)}
        />
      </Box>

      <FilterDialog
        open={showDateRangeModal}
        onClose={() => setShowDateRangeModal(false)}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        customDateRange={customDateRange}
        onCustomDateRangeChange={setCustomDateRange}
        onApplyFilter={() => {
          fetchFilteredOrders();
          setShowDateRangeModal(false);
          if (isMobile) setFilterDrawerOpen(false);
        }}
      />

      <ReceiptModal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        items={receiptItems}
        customerName={selectedContact?.name || "Guest"}
        orderDate={selectedPastOrder?.date || new Date()}
        orderId={selectedPastOrder?.id || ""}
        customerId={selectedContact?.id || ""}
      />

      <ShareMenu
        anchorEl={shareAnchorEl}
        onClose={handleShareClose}
        receiptItems={receiptItems}
        selectedContact={selectedContact}
        grandTotal={grandTotal}
      />

      {isMobile && activeTab === 0 && (
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <Fab
            color="primary"
            onClick={() => placeOrderMutation.mutate()}
            disabled={placeOrderMutation.isLoading || !selectedContact}
          >
            {placeOrderMutation.isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <ShoppingCartIcon />
            )}
          </Fab>
        </motion.div>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
            elevation={6}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </motion.div>
      </Snackbar>
    </Box>
  );
};

export default OrderScreen;
