import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const ReceiptDialog = ({
  open,
  onClose,
  receiptItems,
  selectedContact,
  selectedPastOrder,
  grandTotal,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const calculateSubtotal = (price, quantity) => {
    const priceNum = parseFloat(price) || 0;
    const quantityNum = parseInt(quantity) || 0;
    return (priceNum * quantityNum).toFixed(2);
  };

  const handlePrint = () => {
    // Print functionality implementation
  };

  return (
    <Dialog
      fullScreen={isMobile}
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: 2,
        }}
      >
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{
              mr: 2,
              bgcolor: "primary.light",
              color: "primary.contrastText",
            }}
          >
            <ReceiptIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" component="div" fontWeight={700}>
              Order Receipt
            </Typography>
            <Typography variant="body2">
              {selectedPastOrder?.date ||
                new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2 }}>
        <Box mb={2}>
          <Typography variant="subtitle1" color="text.secondary" mb={1}>
            Customer
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            p={1}
            sx={{
              bgcolor: "grey.100",
              borderRadius: 1,
            }}
          >
            <Avatar sx={{ mr: 2 }}>
              {selectedContact?.name?.charAt(0)?.toUpperCase() || "G"}
            </Avatar>
            <Typography variant="body1">
              {selectedContact?.name || "Guest Customer"}
            </Typography>
          </Box>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" mb={1}>
          Order Summary
        </Typography>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead sx={{ bgcolor: "grey.100" }}>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receiptItems && receiptItems.length > 0 ? (
                  receiptItems.map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right"> {item.price}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {calculateSubtotal(item.price, item.quantity)}
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        No items in this order
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="subtitle1">Total:</Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      color: "success.dark",
                    }}
                  >
                    <Typography variant="subtitle1"> {grandTotal}</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1 }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
            }}
          >
            Print
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            startIcon={<CloseIcon />}
            onClick={onClose}
            variant="outlined"
            color="secondary"
            sx={{
              borderRadius: 2,
            }}
          >
            Close
          </Button>
        </motion.div>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptDialog;
