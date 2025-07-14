import React, { useState, useEffect } from "react";
import ListItemIcon from "@mui/material/ListItemIcon";
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  Paper,
  ListItem,
  ListItemText,
  CircularProgress,
  IconButton,
  Button,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Badge,
  Chip,
} from "@mui/material";
import {
  FilterAlt as FilterIcon,
  Search as SearchIcon,
  DateRange as DateRangeIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { format } from "date-fns/format";
import ReceiptModal from "./ReceiptModal";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import DatePicker from "../DatePicker/DatePicker";

const OrderHistory = ({
  activeTab,
  isMobile,
  selectedContact,
  filteredOrders,
  dateFilter,
  customDateRange,
  onOrderClick,
  onFilterClick,
  onAddNewOrder,
}) => {
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [contactDetails, setContactDetails] = useState(null);

  // Fetch contact details and calculate outstanding amount
  useEffect(() => {
    const fetchContactDetails = async () => {
      if (selectedContact) {
        const contactRef = doc(db, "contacts", selectedContact.id);
        const contactSnap = await getDoc(contactRef);
        if (contactSnap.exists()) {
          setContactDetails(contactSnap.data());

          // Calculate total outstanding
          const ordersRef = collection(db, "orders");
          const q = query(
            ordersRef,
            where("contactId", "==", selectedContact.id),
            where("status", "in", ["pending", "partial"])
          );
          const querySnapshot = await getDocs(q);

          let outstanding = 0;
          querySnapshot.forEach((doc) => {
            const order = doc.data();
            outstanding += order.balanceDue || order.total;
          });

          setTotalOutstanding(outstanding);
        }
      }
    };

    fetchContactDetails();
  }, [selectedContact]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportPdf = () => {
    // PDF export logic
    handleMenuClose();
  };

  const handlePrint = () => {
    // Print logic
    handleMenuClose();
  };

  const handleShare = () => {
    // Share logic
    handleMenuClose();
  };

  const handleViewReceipt = (order) => {
    setCurrentOrder({
      items: order.items,
      customerName: order.contactName,
      orderDate: order.date,
      orderId: order.id,
      customerId: order.contactId,
      total: order.total,
      paidAmount: order.paidAmount,
      balanceDue: order.balanceDue,
      status: order.status,
    });
    setReceiptModalOpen(true);
  };

  const filteredOrdersList = filteredOrders.filter(
    (order) =>
      order.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formattedRange =
    customDateRange?.start && customDateRange?.end
      ? `${format(new Date(customDateRange.start), "MMM d, yyyy")} - ${format(
          new Date(customDateRange.end),
          "MMM d, yyyy"
        )}`
      : "";

  return (
    <Box
      sx={{
        flex: isMobile ? 1 : 0.5,
        minWidth: isMobile ? "100%" : 350,
        display: activeTab === 1 ? "block" : isMobile ? "none" : "block",
      }}
    >
      <ReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        order={currentOrder}
      />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 2,
            height: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent sx={{ flex: 1, overflow: "hidden", p: 0 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedContact
                    ? `Khata Book - ${selectedContact.name}`
                    : "All Transactions"}
                </Typography>
                <Typography variant="caption">
                  {dateFilter === "current"
                    ? "Current month"
                    : dateFilter === "last"
                    ? "Last month"
                    : dateFilter === "custom"
                    ? `Custom range: ${formattedRange}`
                    : "All transactions"}
                </Typography>
              </Box>
              {!isMobile && (
                <IconButton
                  onClick={onFilterClick}
                  sx={{ color: "primary.contrastText" }}
                >
                  <FilterIcon />
                </IconButton>
              )}
            </Box>

            {/* Customer Summary */}
            {selectedContact && (
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selectedContact.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {contactDetails?.phone || "No phone number"}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="caption" display="block">
                    Outstanding
                  </Typography>
                  <Typography variant="h6" color="error.main" fontWeight={700}>
                    ₹{totalOutstanding.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Search and Actions */}
            <Box
              sx={{
                p: 2,
                display: "flex",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  style={{ minWidth: 80 }}
                  startIcon={<DateRangeIcon />}
                  onClick={() => setDatePickerOpen(true)}
                >
                  Date
                </Button>
              </Box>
              <IconButton sx={{ p: 0 }} onClick={handleMenuClick}>
                <MoreIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleExportPdf}>
                  <ListItemIcon>
                    <PdfIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export as PDF</ListItemText>
                </MenuItem>
                <MenuItem onClick={handlePrint}>
                  <ListItemIcon>
                    <PrintIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Print</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleShare}>
                  <ListItemIcon>
                    <ShareIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Share</ListItemText>
                </MenuItem>
              </Menu>
            </Box>

            {/* Date Picker */}
            <Box>
              <DatePicker
                open={datePickerOpen}
                onClose={() => setDatePickerOpen(false)}
                onFilterClick={onFilterClick}
                dateFilter={dateFilter}
                customDateRange={customDateRange}
              />
            </Box>

            {/* Add New Transaction Button */}
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                fullWidth
                onClick={onAddNewOrder}
              >
                Add New Transaction
              </Button>
            </Box>

            {filteredOrdersList.length === 0 ? (
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                }}
              >
                <Typography color="text.secondary">
                  No transactions found for selected filter
                </Typography>
              </Box>
            ) : (
              <List
                sx={{
                  height: selectedContact
                    ? "calc(100% - 280px)"
                    : "calc(100% - 180px)",
                  overflow: "auto",
                  p: 1,
                }}
              >
                {filteredOrdersList.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        onOrderClick(order);
                        handleViewReceipt(order);
                      }}
                    >
                      <ListItem sx={{ py: 1 }}>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <ReceiptIcon
                                fontSize="small"
                                color="action"
                                sx={{ opacity: 0.7 }}
                              />
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600 }}
                              >
                                {order.id}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {order.date}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 0.5,
                                }}
                              >
                                <Typography variant="caption">
                                  {order.items.length} items
                                </Typography>
                                {order.status === "paid" ? (
                                  <Chip
                                    label="Paid"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                ) : order.status === "partial" ? (
                                  <Chip
                                    label={`Paid ₹${order.paidAmount}`}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                  />
                                ) : (
                                  <Chip
                                    label="Pending"
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              color:
                                order.status === "paid"
                                  ? "success.dark"
                                  : "error.main",
                            }}
                          >
                            ₹{Number(order.total || 0).toFixed(2)}
                          </Typography>
                          {order.status !== "paid" && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Due: ₹
                              {Number(order.balanceDue || order.total).toFixed(
                                2
                              )}
                            </Typography>
                          )}
                        </Box>
                      </ListItem>
                    </Paper>
                  </motion.div>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default OrderHistory;
