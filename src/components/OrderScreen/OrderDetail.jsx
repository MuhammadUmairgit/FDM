// src/pages/OrderDetail.js
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";

const OrderDetail = () => {
  const { orderId } = useParams();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery(["order", orderId], async () => {
    const docRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Order not found");
    }
    return {
      id: docSnap.id,
      ...docSnap.data(),
      date: docSnap.data().date?.toDate()?.toLocaleDateString() || "No date",
    };
  });

  const calculateSubtotal = (price, quantity) => {
    return (parseFloat(price) * parseInt(quantity)).toFixed(2);
  };

  const calculateGrandTotal = (items) => {
    return items
      .reduce((total, item) => {
        return total + parseFloat(calculateSubtotal(item.price, item.quantity));
      }, 0)
      .toFixed(2);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Error loading order details
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Orders
        </Button>

        <Typography variant="h4" gutterBottom>
          Order Details
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Order #{order.id.slice(0, 8).toUpperCase()}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body1">
                <strong>Customer:</strong> {order.contactName}
              </Typography>
              <Typography variant="body1">
                <strong>Date:</strong> {order.date}
              </Typography>
              <Typography variant="body1">
                <strong>Total:</strong> {order.total.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Items Ordered
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right"> {item.price}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {calculateSubtotal(item.price, item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="h6">Total:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                        {calculateGrandTotal(order.items)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default OrderDetail;
