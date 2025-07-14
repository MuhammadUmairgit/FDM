import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Badge,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Tooltip,
  TextField,
  Autocomplete,
  Chip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  Share as ShareIcon,
  Inventory as InventoryIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  FilterAlt as FilterIcon,
  AttachMoney as AttachMoneyIcon,
  Numbers as NumbersIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import CustomerSelect from "./CustomerSelect";
import { format } from "date-fns/format";
import ReceiptModal from "./ReceiptModal";

const OrderForm = ({
  activeTab = 0,
  isMobile = false,
  selectedContact = null,
  setSelectedContact = () => {},
  orderItems = [],
  setOrderItems = () => {},
  inventory = [],
  grandTotal = "0.00",
  onShareClick = () => {},
  onPlaceOrder = () => {},
  placeOrderMutation = { isLoading: false, isError: false, error: null },
  dateFilter = "current",
  setShowDateRangeModal = () => {},
  customDateRange = {
    start: new Date(new Date().setDate(1)),
    end: new Date(),
  },
  filteredOrders = [],
  pastOrdersLoading = false,
  handlePastOrderClick = () => {},
}) => {
  const [isHoveringAdd, setIsHoveringAdd] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [cartItems, setCartItems] = useState([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Initialize with one empty row if orderItems is empty
  useEffect(() => {
    if (orderItems.length === 0) {
      setOrderItems([
        { name: "", quantity: "", price: "", available: 0, id: Date.now() },
      ]);
    }
  }, [orderItems.length, setOrderItems]);

  const addNewRow = useCallback(() => {
    setOrderItems((prevItems) => [
      ...prevItems,
      { name: "", quantity: "", price: "", available: 0, id: Date.now() },
    ]);
  }, [setOrderItems]);

  const removeRow = useCallback(
    (index) => {
      if (orderItems.length > 1) {
        setOrderItems((prevItems) => {
          const newItems = [...prevItems];
          newItems.splice(index, 1);
          return newItems;
        });
      }
    },
    [orderItems.length, setOrderItems]
  );

  const handleSaveToCart = useCallback(() => {
    const validItems = orderItems.filter(
      (item) => item.name && item.quantity && item.price
    );

    if (validItems.length === 0) {
      setSnackbar({
        open: true,
        message: "Please add valid items to save to cart",
        severity: "error",
      });
      return;
    }

    setCartItems((prev) => [...prev, ...validItems]);
    setSnackbar({
      open: true,
      message: `${validItems.length} items added to cart!`,
      severity: "success",
    });

    // Clear only the valid items from the form
    const remainingItems = orderItems.filter(
      (item) => !item.name || !item.quantity || !item.price
    );
    setOrderItems(
      remainingItems.length > 0
        ? remainingItems
        : [{ name: "", quantity: "", price: "", available: 0, id: Date.now() }]
    );
  }, [orderItems, setOrderItems]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const removeCartItem = (index) => {
    setCartItems((prev) => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  const calculateCartTotal = () => {
    return cartItems
      .reduce((total, item) => {
        const priceNum = parseFloat(item.price) || 0;
        const quantityNum = parseInt(item.quantity) || 0;
        return total + priceNum * quantityNum;
      }, 0)
      .toFixed(2);
  };

  const loadCartItemsToForm = () => {
    if (cartItems.length === 0) {
      setSnackbar({
        open: true,
        message: "No items in cart to load",
        severity: "warning",
      });
      return;
    }

    setOrderItems((prev) => [...prev, ...cartItems]);
    setCartItems([]);
    setCartDrawerOpen(false);
    setSnackbar({
      open: true,
      message: "Cart items loaded to order form",
      severity: "success",
    });
  };

  const handleNameChange = (value, index) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      name: value,
      price: "",
      available: 0,
    };
    setOrderItems(updatedItems);

    if (value.trim().length > 0) {
      // Filter inventory and remove duplicates by name
      const filtered = inventory
        .filter((item) => item.name.toLowerCase().includes(value.toLowerCase()))
        // Use reduce to create a map of unique items by name
        .reduce((acc, current) => {
          const existingItem = acc.find(
            (item) => item.name.toLowerCase() === current.name.toLowerCase()
          );
          if (!existingItem) {
            return [...acc, current];
          }
          return acc;
        }, []);

      setSuggestions(filtered);
      setActiveSuggestionIndex(index);
    } else {
      setSuggestions([]);
      setActiveSuggestionIndex(null);
    }
  };

  const handleSuggestionSelect = (item, index) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      name: item.name,
      price: item.price.toString(),
      available: parseInt(item.quantity) || 0,
      quantity: updatedItems[index].quantity || "1",
    };
    setOrderItems(updatedItems);
    setSuggestions([]);
    setActiveSuggestionIndex(null);
  };

  const handleQuantityChange = (value, index) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: numericValue,
    };
    setOrderItems(updatedItems);
  };

  const calculateSubtotal = (price, quantity) => {
    const priceNum = parseFloat(price) || 0;
    const quantityNum = parseInt(quantity) || 0;
    return (priceNum * quantityNum).toFixed(2);
  };

  const formatDate = (date) => {
    try {
      return date ? format(new Date(date), "MMM dd, yyyy") : "";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleViewReceipt = (order) => {
    setCurrentOrder({
      items: order.items,
      customerName: order.contactName,
      orderDate: order.date,
      orderId: order.id,
      customerId: order.contactId,
    });
    setReceiptModalOpen(true);
  };

  // Check if order is valid for submission
  const isOrderValid = () => {
    if (!selectedContact) {
      setSnackbar({
        open: true,
        message: "Please select a customer",
        severity: "error",
      });
      return false;
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
      return false;
    }

    return true;
  };

  const handlePlaceOrder = () => {
    if (!isOrderValid()) return;

    // Filter out empty items
    const itemsToSubmit = orderItems.filter(
      (item) => item.name && item.quantity && item.price
    );

    onPlaceOrder({
      contactId: selectedContact.id,
      contactName: selectedContact.name,
      items: itemsToSubmit,
      total: grandTotal,
    });
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: activeTab === 0 ? "block" : isMobile ? "none" : "block",
        position: "relative",
      }}
    >
      {/* Receipt Modal */}
      <ReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        items={currentOrder?.items || []}
        customerName={currentOrder?.customerName}
        orderDate={currentOrder?.orderDate}
        orderId={currentOrder?.orderId}
        customerId={currentOrder?.customerId}
      />

      {/* Cart Drawer */}
      <SwipeableDrawer
        anchor="right"
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onOpen={() => setCartDrawerOpen(true)}
        sx={{
          "& .MuiDrawer-paper": {
            width: isMobile ? "85%" : 400,
            p: 2,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Your Cart ({cartItems.length})
          </Typography>
          <IconButton onClick={() => setCartDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {cartItems.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "50%",
              textAlign: "center",
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 60, color: "text.disabled" }} />
            <Typography variant="subtitle1" color="text.secondary" mt={2}>
              Your cart is empty
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ overflow: "auto", flexGrow: 1 }}>
              {cartItems.map((item, index) => (
                <Paper
                  key={`cart-${index}`}
                  elevation={1}
                  sx={{ mb: 1, borderRadius: 2 }}
                >
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => removeCartItem(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {item.price} × {item.quantity} = $
                            {calculateSubtotal(item.price, item.quantity)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" fontWeight={700}>
                ${calculateCartTotal()}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={loadCartItemsToForm}
              sx={{ mb: 2 }}
            >
              Load to Order Form
            </Button>
          </>
        )}
      </SwipeableDrawer>

      {/* Cart Icon Badge */}
      <Box
        sx={{
          position: "fixed",
          top: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          zIndex: 1000,
        }}
      >
        <Tooltip title="View cart items">
          <Badge
            badgeContent={cartItems.length}
            color="primary"
            overlap="circular"
          >
            <IconButton
              color="inherit"
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              }}
              onClick={() => setCartDrawerOpen(true)}
            >
              <ShoppingCartIcon />
            </IconButton>
          </Badge>
        </Tooltip>
      </Box>

      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "primary.main",
              }}
            >
              Create New Order
            </Typography>
            <Button
              startIcon={<FilterIcon />}
              variant="outlined"
              onClick={() => setShowDateRangeModal(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Filter Orders
            </Button>
          </Box>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <CardContent>
            <CustomerSelect
              selectedContact={selectedContact}
              setSelectedContact={setSelectedContact}
              isMobile={isMobile}
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <InventoryIcon
                sx={{
                  fontSize: 28,
                  mr: 1,
                  color: "primary.main",
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Order Items
              </Typography>
            </Box>

            <AnimatePresence>
              {orderItems.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{
                    duration: 0.3,
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      boxShadow: 1,
                      position: "relative",
                      pr: 6,
                    }}
                  >
                    {orderItems.length > 1 && (
                      <IconButton
                        onClick={() => removeRow(index)}
                        color="error"
                        sx={{
                          position: "absolute",
                          top: 16,
                          right: 8,
                          bgcolor: "error.light",
                          "&:hover": {
                            bgcolor: "error.main",
                            color: "white",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}

                    <Box sx={{ mb: 2 }}>
                      <Autocomplete
                        freeSolo
                        options={
                          activeSuggestionIndex === index ? suggestions : []
                        }
                        getOptionLabel={(option) =>
                          typeof option === "string"
                            ? option
                            : option.name || ""
                        }
                        inputValue={item.name}
                        onInputChange={(_, newValue) => {
                          handleNameChange(newValue, index);
                        }}
                        onChange={(_, newValue) => {
                          if (newValue && typeof newValue === "object") {
                            handleSuggestionSelect(newValue, index);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Item Name"
                            fullWidth
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <InventoryIcon
                                    color="action"
                                    sx={{ fontSize: 20 }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box
                            component="li"
                            {...props}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              p: 1,
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                              }}
                            >
                              {option.name}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                              }}
                            >
                              <Chip
                                label={`$${option.price.toFixed(2)}`}
                                size="small"
                                sx={{
                                  bgcolor: "success.light",
                                  color: "success.dark",
                                  fontSize: "0.7rem",
                                }}
                              />
                              <Chip
                                label={`Stock: ${option.quantity}`}
                                size="small"
                                sx={{
                                  bgcolor: "info.light",
                                  color: "info.dark",
                                  fontSize: "0.7rem",
                                }}
                              />
                            </Box>
                          </Box>
                        )}
                        componentsProps={{
                          paper: {
                            sx: {
                              borderRadius: 2,
                              boxShadow: 2,
                              mt: 1,
                            },
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: isMobile
                          ? "1fr 1fr"
                          : "120px 100px",
                        gap: 2,
                      }}
                    >
                      <TextField
                        label="Price"
                        value={item.price}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoneyIcon sx={{ fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                      />

                      <Tooltip
                        title={
                          parseInt(item.quantity) > item.available
                            ? `Only ${item.available} available`
                            : ""
                        }
                        placement="top"
                        arrow
                      >
                        <TextField
                          label="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(e.target.value, index)
                          }
                          variant="outlined"
                          size={isMobile ? "small" : "medium"}
                          type="number"
                          error={
                            parseInt(item.quantity) > item.available ||
                            parseInt(item.quantity) <= 0
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <NumbersIcon sx={{ fontSize: 20 }} />
                              </InputAdornment>
                            ),
                            inputProps: {
                              min: 1,
                              max: item.available || 9999,
                            },
                          }}
                          fullWidth
                        />
                      </Tooltip>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHoveringAdd(true)}
              onHoverEnd={() => setIsHoveringAdd(false)}
            >
              <Button
                startIcon={
                  <motion.div
                    animate={{ rotate: isHoveringAdd ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AddIcon />
                  </motion.div>
                }
                onClick={addNewRow}
                variant="outlined"
                fullWidth
                sx={{
                  mt: 1,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                Add Item
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Order Total
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "success.dark",
                }}
              >
                ${grandTotal}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          mb: 2,
        }}
      >
        {!isMobile && (
          <>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSaveToCart}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Save to Cart
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                startIcon={<ShareIcon />}
                onClick={onShareClick}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Share
              </Button>
            </motion.div>
          </>
        )}

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            startIcon={
              placeOrderMutation.isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ShoppingCartIcon />
              )
            }
            onClick={handlePlaceOrder}
            variant="contained"
            disabled={
              placeOrderMutation.isLoading ||
              !selectedContact ||
              orderItems.filter(
                (item) => item.name && item.quantity && item.price
              ).length === 0
            }
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: 600,
              fontSize: isMobile ? "0.875rem" : "1rem",
              minWidth: isMobile ? "auto" : "initial",
            }}
          >
            {placeOrderMutation.isLoading ? "Processing..." : "Place Order"}
          </Button>
        </motion.div>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(OrderForm);
