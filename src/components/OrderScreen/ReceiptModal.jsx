// src/components/ReceiptModal.js
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Box,
  useTheme,
  styled,
  useMediaQuery,
  IconButton,
  Zoom,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Stack,
} from "@mui/material";
import {
  Print as PrintIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Share as ShareIcon,
  PictureAsPdf as PdfIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";
import { useAuth } from "../Auth/AuthContext";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import isValid from "date-fns/isValid";
import subMonths from "date-fns/subMonths";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const ReceiptItem = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: `1px dashed ${theme.palette.divider}`,
  "&:last-child": {
    borderBottom: "none",
  },
}));

const ReceiptTotal = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 0",
  marginTop: "8px",
  borderTop: `2px solid ${theme.palette.divider}`,
  borderBottom: `2px solid ${theme.palette.divider}`,
  fontWeight: 700,
  fontSize: "1.1rem",
  color: theme.palette.success.main,
}));

const formatDateTime = (dateString) => {
  try {
    if (!dateString) return format(new Date(), "MMM dd, yyyy hh:mm a");

    let date;
    if (typeof dateString === "string") {
      date = parseISO(dateString);
      if (!isValid(date)) {
        date = new Date(dateString);
      }
    } else if (dateString.toDate) {
      date = dateString.toDate();
    } else {
      date = new Date(dateString);
    }

    if (!isValid(date)) {
      return format(new Date(), "MMM dd, yyyy hh:mm a");
    }

    return format(date, "MMM dd, yyyy hh:mm a");
  } catch (error) {
    console.error("Error formatting date:", error);
    return format(new Date(), "MMM dd, yyyy hh:mm a");
  }
};

const OrderHistoryModal = ({ open, onClose, customerId }) => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: subMonths(new Date(), 1),
    end: new Date(),
  });

  useEffect(() => {
    if (open && customerId) {
      fetchOrders();
    }
  }, [open, customerId, dateRange]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersQuery = query(
        collection(db, "orders"),
        where("contactId", "==", customerId),
        where("date", ">=", dateRange.start),
        where("date", "<=", dateRange.end)
      );
      const querySnapshot = await getDocs(ordersQuery);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      }));
      setOrders(ordersData.sort((a, b) => b.date - a.date));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field) => (newValue) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Order History</Typography>
          <Box display="flex" gap={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From"
                value={dateRange.start}
                onChange={handleDateChange("start")}
                maxDate={dateRange.end}
                renderInput={(params) => (
                  <TextField {...params} size="small" />
                )}
              />
              <DatePicker
                label="To"
                value={dateRange.end}
                onChange={handleDateChange("end")}
                minDate={dateRange.start}
                maxDate={new Date()}
                renderInput={(params) => (
                  <TextField {...params} size="small" />
                )}
              />
            </LocalizationProvider>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Typography textAlign="center" p={2}>
            No orders found for the selected date range
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Total (PKR)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{formatDateTime(order.date)}</TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell align="right">
                      {order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<ReceiptIcon />}
                        onClick={() => {
                          onClose();
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const ReceiptModal = ({
  open,
  onClose,
  items,
  customerName,
  orderDate,
  orderId,
  customerId,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentUser } = useAuth();
  const [orderHistoryModalOpen, setOrderHistoryModalOpen] = useState(false);
  const [ordersThisMonth, setOrdersThisMonth] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (open && customerId) {
      fetchOrdersThisMonth();
    }
  }, [open, customerId]);

  const fetchOrdersThisMonth = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const ordersQuery = query(
        collection(db, "orders"),
        where("contactId", "==", customerId),
        where("date", ">=", startOfMonth)
      );
      const querySnapshot = await getDocs(ordersQuery);
      setOrdersThisMonth(querySnapshot.size);
    } catch (error) {
      console.error("Error fetching orders this month:", error);
    }
  };

  const formatCurrency = (value) => {
    const num = typeof value === "string" ? parseFloat(value) : Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const calculateSubtotal = (price, quantity) => {
    const priceNum = parseFloat(price) || 0;
    const quantityNum = parseInt(quantity) || 0;
    return priceNum * quantityNum;
  };

  const calculateGrandTotal = () => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => {
      return total + calculateSubtotal(item.price, item.quantity);
    }, 0);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text("Inventory Pro - Purchase Receipt", 105, 15, null, null, "center");
    doc.setFontSize(10);
    doc.text("Contact: Siddiq - 923368577910", 105, 22, null, null, "center");
    doc.text("Owais - 923213407102", 105, 27, null, null, "center");

    // Add divider
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 32, 195, 32);

    // Add order info
    doc.setFontSize(10);
    doc.text(`Date: ${formatDateTime(orderDate)}`, 15, 40);
    doc.text(
      `Order #: ${orderId || "N/A"} (${ordersThisMonth} this month)`,
      15,
      45
    );
    doc.text(`Customer: ${customerName || "Guest"}`, 15, 50);

    // Add items header
    doc.setFontSize(10);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 57, 195, 57);
    doc.text("ITEM", 20, 62);
    doc.text("PRICE (PKR)", 80, 62);
    doc.text("QTY", 120, 62);
    doc.text("TOTAL (PKR)", 160, 62);
    doc.line(15, 65, 195, 65);

    // Add items
    let y = 72;
    items.forEach((item) => {
      doc.text(item.name, 20, y);
      doc.text(formatCurrency(item.price), 80, y);
      doc.text(item.quantity.toString(), 120, y);
      doc.text(
        formatCurrency(calculateSubtotal(item.price, item.quantity)),
        160,
        y
      );
      y += 7;
    });

    // Add total
    doc.setFontSize(12);
    doc.setDrawColor(100, 100, 100);
    doc.line(15, y + 5, 195, y + 5);
    doc.text("TOTAL (PKR):", 120, y + 12);
    doc.text(formatCurrency(calculateGrandTotal()), 160, y + 12);
    doc.line(15, y + 15, 195, y + 15);

    // Add footer
    doc.setFontSize(8);
    doc.text("Thank you for your purchase!", 105, y + 25, null, null, "center");
    doc.text("Please visit again", 105, y + 30, null, null, "center");
    if (currentUser) {
      doc.text(
        `Processed by: ${currentUser.email}`,
        105,
        y + 35,
        null,
        null,
        "center"
      );
    }

    return doc;
  };

  const handlePrint = async () => {
    try {
      setPdfLoading(true);
      const doc = generatePDF();
      if (isMobile) {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
          <html>
            <head>
              <title>Inventory Pro - Purchase Receipt</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 10px;
                  font-size: 14px;
                  color: #000;
                }
                .receipt-header { 
                  text-align: center; 
                  margin-bottom: 10px; 
                }
                .receipt-title { 
                  font-size: 18px; 
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .receipt-info {
                  margin-bottom: 15px;
                }
                .receipt-divider {
                  border-top: 1px dashed #000;
                  margin: 5px 0;
                }
                .receipt-item {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                }
                .receipt-total {
                  display: flex;
                  justify-content: space-between;
                  margin-top: 10px;
                  font-weight: bold;
                  border-top: 2px solid #000;
                  border-bottom: 2px solid #000;
                  padding: 5px 0;
                }
                .receipt-footer {
                  text-align: center;
                  margin-top: 15px;
                  font-size: 12px;
                }
                .align-right {
                  text-align: right;
                  width: 70px;
                }
                .align-center {
                  text-align: center;
                  width: 50px;
                }
              </style>
            </head>
            <body>
              <div class="receipt-header">
                <div class="receipt-title">Inventory Pro - Purchase Receipt</div>
                <div>Contact: Siddiq - 923368577910</div>
                <div>Owais - 923213407102</div>
              </div>
              
              <div class="receipt-divider"></div>
              
              <div class="receipt-info">
                <div>Date: ${formatDateTime(orderDate)}</div>
                <div>Order #: ${
                  orderId || "N/A"
                } (${ordersThisMonth} this month)</div>
                <div>Customer: ${customerName || "Guest"}</div>
              </div>
              
              <div class="receipt-divider"></div>
              
              <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <div style="width: 40%;">ITEM</div>
                <div class="align-right">PRICE (PKR)</div>
                <div class="align-center">QTY</div>
                <div class="align-right">TOTAL (PKR)</div>
              </div>
              
              <div class="receipt-divider"></div>
              
              ${items
                .map(
                  (item) => `
                <div class="receipt-item">
                  <div style="width: 40%;">${item.name}</div>
                  <div class="align-right">${formatCurrency(item.price)}</div>
                  <div class="align-center">${item.quantity}</div>
                  <div class="align-right">${formatCurrency(
                    calculateSubtotal(item.price, item.quantity)
                  )}</div>
                </div>
              `
                )
                .join("")}
              
              <div class="receipt-divider"></div>
              
              <div class="receipt-total">
                <div>TOTAL (PKR):</div>
                <div class="align-right">${formatCurrency(
                  calculateGrandTotal()
                )}</div>
              </div>
              
              <div class="receipt-footer">
                <div>Thank you for your purchase!</div>
                <div>Please visit again</div>
                ${
                  currentUser
                    ? `<div>Processed by: ${currentUser.email}</div>`
                    : ""
                }
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      } else {
        doc.autoPrint();
        doc.output("dataurlnewwindow");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setPdfLoading(true);
      const doc = generatePDF();
      doc.save(`inventory_pro_receipt_${orderId || Date.now()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const shareOnWhatsApp = () => {
    const message =
      `Inventory Pro - Purchase Receipt\n` +
      `Date: ${formatDateTime(orderDate)}\n` +
      `Order #: ${orderId || "N/A"} (${ordersThisMonth} this month)\n` +
      `Customer: ${customerName || "Guest"}\n` +
      `Contact: Siddiq - 923368577910\n` +
      `Owais - 923213407102\n\n` +
      items
        .map(
          (item) =>
            `${item.name} - ${formatCurrency(item.price)} PKR x ${
              item.quantity
            } = ${formatCurrency(
              calculateSubtotal(item.price, item.quantity)
            )} PKR`
        )
        .join("\n") +
      `\n\nTOTAL: ${formatCurrency(calculateGrandTotal())} PKR\n\n` +
      `Thank you for your purchase!` +
      (currentUser ? `\nProcessed by: ${currentUser.email}` : "");

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 1,
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[900]
                : theme.palette.grey[100],
            py: 1,
            position: "relative",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            INVENTORY PRO - PURCHASE RECEIPT
          </Typography>
          {!isMobile && (
            <IconButton
              onClick={onClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: theme.palette.text.primary,
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ py: 2 }}>
          <Box textAlign="center" mb={1}>
            <Typography variant="body2">
              Contact: Siddiq - 923368577910
            </Typography>
            <Typography variant="body2">Owais - 923213407102</Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box mb={2}>
            <Typography variant="body2">
              <strong>Date:</strong> {formatDateTime(orderDate)}
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="body2">
                <strong>Order #:</strong> {orderId || "N/A"}
              </Typography>
              <Button
                size="small"
                startIcon={<FilterIcon />}
                sx={{ ml: 1 }}
                onClick={() => setOrderHistoryModalOpen(true)}
              >
                ({ordersThisMonth} this month)
              </Button>
            </Box>
            <Typography variant="body2">
              <strong>Customer:</strong> {customerName || "Guest"}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box
            display="flex"
            justifyContent="space-between"
            fontWeight="bold"
            mb={1}
          >
            <Typography variant="body2" sx={{ width: "40%" }}>
              ITEM
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "right", width: "20%" }}>
              PRICE (PKR)
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "center", width: "15%" }}>
              QTY
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "right", width: "25%" }}>
              TOTAL (PKR)
            </Typography>
          </Box>

          <Divider sx={{ mb: 1 }} />

          <Box>
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <ReceiptItem key={index}>
                  <Typography variant="body2" sx={{ width: "40%" }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: "right", width: "20%" }}>
                    {formatCurrency(item.price)}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: "center", width: "15%" }}>
                    {item.quantity}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: "right", width: "25%" }}>
                    {formatCurrency(
                      calculateSubtotal(item.price, item.quantity)
                    )}
                  </Typography>
                </ReceiptItem>
              ))
            ) : (
              <Typography variant="body2" textAlign="center" py={2}>
                No items in this order
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 1 }} />

          <ReceiptTotal>
            <Typography variant="body1">TOTAL (PKR):</Typography>
            <Typography variant="body1">
              {formatCurrency(calculateGrandTotal())}
            </Typography>
          </ReceiptTotal>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              Thank you for your purchase!
            </Typography>
            {currentUser && (
              <Typography variant="body2" mt={1}>
                Processed by: {currentUser.email}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 2,
            py: 1,
            justifyContent: "space-between",
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[900]
                : theme.palette.grey[100],
          }}
        >
          <Box>
            {!isMobile && (
              <Button
                startIcon={<ShareIcon />}
                variant="outlined"
                size="small"
                color="primary"
                sx={{ mr: 1 }}
                onClick={shareOnWhatsApp}
              >
                Share
              </Button>
            )}
            <Button
              startIcon={<PdfIcon />}
              variant="outlined"
              size="small"
              color="error"
              onClick={downloadPDF}
              disabled={pdfLoading}
            >
              {pdfLoading ? "Generating..." : "PDF"}
            </Button>
          </Box>
          <Box>
            <Zoom in={true} style={{ transitionDelay: "100ms" }}>
              <Button
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                variant="contained"
                color="primary"
                size="small"
                sx={{ mr: 1 }}
                disabled={pdfLoading}
              >
                {pdfLoading
                  ? "Processing..."
                  : isMobile
                  ? "Print"
                  : "Print Receipt"}
              </Button>
            </Zoom>
            <Button
              startIcon={<CloseIcon />}
              onClick={onClose}
              variant="outlined"
              size="small"
              color="secondary"
            >
              Close
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <OrderHistoryModal
        open={orderHistoryModalOpen}
        onClose={() => setOrderHistoryModalOpen(false)}
        customerId={customerId}
      />
    </>
  );
};

ReceiptModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
      quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
    })
  ),
  customerName: PropTypes.string,
  orderDate: PropTypes.string,
  orderId: PropTypes.string,
  customerId: PropTypes.string,
};

ReceiptModal.defaultProps = {
  items: [],
  customerName: "",
  orderDate: "",
  orderId: "",
  customerId: "",
};

export default ReceiptModal;